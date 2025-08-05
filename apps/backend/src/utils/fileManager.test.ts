import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  setupProject,
  cleanupProject,
  getSanitizedDirName,
  createRustProject,
  type ProjectSetup
} from './fileManager';

describe('fileManager Security Tests', () => {
  let testDirs: string[] = [];

  afterEach(async () => {
    // Clean up any test directories
    for (const dir of testDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    testDirs = [];
  });

  describe('getSanitizedDirName', () => {
    it('should sanitize path traversal attempts', () => {
      expect(getSanitizedDirName('../malicious')).toBe('malicious');
      expect(getSanitizedDirName('../../etc/passwd')).toBe('etc_passwd');
      expect(getSanitizedDirName('../../../root')).toBe('root');
      expect(getSanitizedDirName('..\\..\\windows')).toBe('windows');
    });

    it('should handle Windows reserved filenames', () => {
      const windowsReserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'LPT1', 'LPT2'];

      for (const reserved of windowsReserved) {
        const result = getSanitizedDirName(reserved);
        expect(result).not.toBe(reserved.toLowerCase());
        expect(result).not.toBe(reserved.toUpperCase());
        // Should return 'project' as fallback for reserved names
        expect(result).toBe('project');
      }
    });

    it('should handle dangerous characters', () => {
      const dangerousChars = '<>:"/\\\\|?*';
      const result = getSanitizedDirName(`test${dangerousChars}name`);

      // Should not contain any of the dangerous characters
      for (const char of dangerousChars) {
        expect(result).not.toContain(char);
      }

      expect(result).toContain('test');
      expect(result).toContain('name');
    });

    it('should handle unicode and emoji', () => {
      expect(getSanitizedDirName('test🚀project')).toBeTruthy();
      expect(getSanitizedDirName('tëst-prøjéct')).toBeTruthy();
      expect(getSanitizedDirName('测试项目')).toBeTruthy();
    });

    it('should handle long filenames', () => {
      const longName = 'a'.repeat(300);
      const result = getSanitizedDirName(longName);

      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty and whitespace inputs', () => {
      expect(getSanitizedDirName('')).toBe('');
      expect(getSanitizedDirName('   ')).toBe('');
      expect(getSanitizedDirName('\t\n\r')).toBe('');
    });

    it('should handle null and undefined inputs', () => {
      expect(getSanitizedDirName(null as any)).toBe('');
      expect(getSanitizedDirName(undefined as any)).toBe('');
      expect(getSanitizedDirName(123 as any)).toBe('');
    });

    it('should preserve valid directory names', () => {
      expect(getSanitizedDirName('valid-project')).toBe('valid-project');
      expect(getSanitizedDirName('my_contract_v1')).toBe('my_contract_v1');
      expect(getSanitizedDirName('Project123')).toBe('Project123');
    });
  });

  describe('setupProject', () => {
    it('should create unique directories with sanitized names', async () => {
      const project1 = await setupProject({ baseName: '../malicious' });
      const project2 = await setupProject({ baseName: '../malicious' });

      testDirs.push(project1.tempDir, project2.tempDir);

      // Should create different directories even with same base name
      expect(project1.tempDir).not.toBe(project2.tempDir);

      // Should not contain path traversal
      expect(project1.tempDir).not.toContain('../');
      expect(project2.tempDir).not.toContain('../');

      // Should be in system temp directory
      expect(project1.tempDir.startsWith(tmpdir())).toBe(true);
      expect(project2.tempDir.startsWith(tmpdir())).toBe(true);

      // Directories should exist
      const stats1 = await fs.stat(project1.tempDir);
      const stats2 = await fs.stat(project2.tempDir);
      expect(stats1.isDirectory()).toBe(true);
      expect(stats2.isDirectory()).toBe(true);

      // Cleanup
      await project1.cleanup();
      await project2.cleanup();
    });

    it('should handle Windows reserved names safely', async () => {
      const project = await setupProject({ baseName: 'CON' });
      testDirs.push(project.tempDir);

      // Should not contain 'CON' as directory name
      const dirName = project.tempDir.split(/[/\\]/).pop() || '';
      expect(dirName.toLowerCase()).not.toBe('con');

      // Should still create a valid directory
      const stats = await fs.stat(project.tempDir);
      expect(stats.isDirectory()).toBe(true);

      await project.cleanup();
    });

    it('should create directories with fallback names for empty inputs', async () => {
      const project = await setupProject({ baseName: '' });
      testDirs.push(project.tempDir);

      // Should create a directory even with empty base name
      const stats = await fs.stat(project.tempDir);
      expect(stats.isDirectory()).toBe(true);

      // Directory name should contain 'project' as fallback
      const dirName = project.tempDir.split(/[/\\]/).pop() || '';
      expect(dirName).toContain('project');

      await project.cleanup();
    });

    it('should prevent directory creation outside temp folder with custom tempRoot', async () => {
      // This should work - using a subdirectory of temp
      const customTemp = join(tmpdir(), 'custom-temp');
      await fs.mkdir(customTemp, { recursive: true });
      testDirs.push(customTemp);

      const project = await setupProject({
        baseName: 'test',
        tempRoot: customTemp
      });
      testDirs.push(project.tempDir);

      expect(project.tempDir.startsWith(customTemp)).toBe(true);

      const stats = await fs.stat(project.tempDir);
      expect(stats.isDirectory()).toBe(true);

      await project.cleanup();
    });
  });

  describe('cleanupProject', () => {
    it('should safely remove project directories', async () => {
      const project = await setupProject({ baseName: 'cleanup-test' });

      // Verify directory exists
      let stats = await fs.stat(project.tempDir);
      expect(stats.isDirectory()).toBe(true);

      // Create some files in the directory
      await fs.writeFile(join(project.tempDir, 'test.txt'), 'test content');
      await fs.mkdir(join(project.tempDir, 'subdir'));
      await fs.writeFile(join(project.tempDir, 'subdir', 'nested.txt'), 'nested content');

      // Cleanup should remove everything
      await cleanupProject(project.tempDir);

      // Directory should no longer exist
      await expect(fs.stat(project.tempDir)).rejects.toThrow();
    });

    it('should refuse to clean directories outside temp folder', async () => {
      // Try to clean a directory outside temp
      const maliciousPath = '/etc/passwd';

      await expect(cleanupProject(maliciousPath)).rejects.toThrow(
        'Refusing to clean directory outside temp folder'
      );
    });

    it('should handle non-existent directories gracefully', async () => {
      const nonExistentPath = join(tmpdir(), 'non-existent-dir-12345');

      // Should not throw error for non-existent directory
      await expect(cleanupProject(nonExistentPath)).resolves.toBeUndefined();
    });

    it('should validate input parameters', async () => {
      await expect(cleanupProject('')).rejects.toThrow('Invalid tempDir provided');
      await expect(cleanupProject(null as any)).rejects.toThrow('Invalid tempDir provided');
      await expect(cleanupProject(undefined as any)).rejects.toThrow('Invalid tempDir provided');
    });
  });

  describe('createRustProject', () => {
    it('should create valid Rust project structure', async () => {
      const project = await setupProject({ baseName: 'rust-test' });
      testDirs.push(project.tempDir);

      const rustCode = `
use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello() -> &'static str {
        "Hello, Soroban!"
    }
}

#[cfg(test)]
mod test {
    use super::*;
    
    #[test]
    fn test_hello() {
        assert_eq!(HelloContract::hello(), "Hello, Soroban!");
    }
}
      `.trim();

      await createRustProject(project.tempDir, rustCode);

      // Verify Cargo.toml exists and contains expected content
      const cargoToml = await fs.readFile(join(project.tempDir, 'Cargo.toml'), 'utf8');
      expect(cargoToml).toContain('[package]');
      expect(cargoToml).toContain('soroban-sdk');
      expect(cargoToml).toContain('crate-type = ["cdylib"]');

      // Verify lib.rs exists with the provided code
      const libRs = await fs.readFile(join(project.tempDir, 'src', 'lib.rs'), 'utf8');
      expect(libRs).toBe(rustCode);

      // Verify src directory structure
      const srcStats = await fs.stat(join(project.tempDir, 'src'));
      expect(srcStats.isDirectory()).toBe(true);

      await project.cleanup();
    });

    it('should validate input parameters', async () => {
      const project = await setupProject();
      testDirs.push(project.tempDir);

      await expect(createRustProject('', 'code')).rejects.toThrow('Invalid tempDir provided');
      await expect(createRustProject(project.tempDir, '')).rejects.toThrow('Invalid rustCode provided');
      await expect(createRustProject(project.tempDir, null as any)).rejects.toThrow('Invalid rustCode provided');

      await project.cleanup();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow with malicious inputs', async () => {
      // Test complete workflow with various malicious inputs
      const maliciousInputs = [
        '../../../malicious',
        'CON.txt',
        'test<script>alert("xss")</script>',
        '../../../../etc/passwd',
        'very'.repeat(10), // Long name (reduced to avoid filesystem limits)
      ];

      for (const maliciousInput of maliciousInputs) {
        const project = await setupProject({ baseName: maliciousInput });
        testDirs.push(project.tempDir);

        // Should create safe directory
        expect(project.tempDir.startsWith(tmpdir())).toBe(true);
        expect(project.tempDir).not.toContain('../');

        // Should be able to create Rust project
        const rustCode = 'pub fn hello() -> &\'static str { "Hello" }';
        await createRustProject(project.tempDir, rustCode);

        // Files should exist
        const stats = await fs.stat(join(project.tempDir, 'Cargo.toml'));
        expect(stats.isFile()).toBe(true);

        // Cleanup should work
        await project.cleanup();

        // Directory should be gone
        await expect(fs.stat(project.tempDir)).rejects.toThrow();
      }
    });
  });
});