import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import sanitizeFilename from 'sanitize-filename';

/**
 * Configuration interface for project setup
 */
export interface ProjectSetup {
  /** Absolute path to the temporary directory */
  tempDir: string;
  /** Function to clean up the temporary directory */
  cleanup: () => Promise<void>;
}

/**
 * Options for project setup
 */
export interface ProjectSetupOptions {
  /** Base name for the project directory (will be sanitized) */
  baseName?: string;
  /** Custom temporary directory root (defaults to OS temp dir) */
  tempRoot?: string;
}

/**
 * Sanitizes a directory name to prevent path traversal and ensure cross-platform compatibility
 * 
 * @param baseName - The base name to sanitize
 * @returns A sanitized directory name safe for use across platforms
 * 
 * @example
 * ```typescript
 * getSanitizedDirName('../malicious') // returns 'malicious'
 * getSanitizedDirName('CON') // returns '' (Windows reserved name)
 * getSanitizedDirName('my-project') // returns 'my-project'
 * ```
 */
export function getSanitizedDirName(baseName: string): string {
  if (!baseName || typeof baseName !== 'string') {
    return '';
  }

  const trimmed = baseName.trim();

  // Handle whitespace-only strings
  if (!trimmed) {
    return '';
  }

  // Sanitize the filename to remove dangerous characters and reserved names
  let sanitized = sanitizeFilename(trimmed, { replacement: '_' });

  // Additional cleanup for path traversal attempts
  sanitized = sanitized.replace(/\.\./g, '').replace(/^[._]+/, '');

  // Ensure it's not too long (filesystem limit is usually 255, leave room for timestamp/random)
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  // Additional safety: ensure it's not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    return 'project';
  }

  return sanitized;
}

/**
 * Creates a unique, sanitized temporary directory for Rust project compilation
 * 
 * @param options - Configuration options for directory creation
 * @returns Promise resolving to ProjectSetup with directory path and cleanup function
 * 
 * @throws {Error} When directory creation fails
 * 
 * @example
 * ```typescript
 * const project = await setupProject({ baseName: 'my-contract' });
 * try {
 *   // Use project.tempDir for compilation
 *   console.log('Working in:', project.tempDir);
 * } finally {
 *   await project.cleanup();
 * }
 * ```
 */
export async function setupProject(options: ProjectSetupOptions = {}): Promise<ProjectSetup> {
  const { baseName = 'project', tempRoot = tmpdir() } = options;

  // Create a unique identifier to prevent collisions
  const timestamp = Date.now();
  const randomId = randomBytes(8).toString('hex');

  // Sanitize the base name
  const sanitizedBase = getSanitizedDirName(baseName);

  // Create unique directory name - ensure we always have a base name
  const finalBaseName = sanitizedBase || 'project';
  const dirName = `${finalBaseName}_${timestamp}_${randomId}`;
  const tempDir = join(tempRoot, dirName);

  try {
    // Create the temporary directory
    await fs.mkdir(tempDir, { recursive: true });

    // Verify the directory was created and is accessible
    const stats = await fs.stat(tempDir);
    if (!stats.isDirectory()) {
      throw new Error(`Created path is not a directory: ${tempDir}`);
    }

    return {
      tempDir,
      cleanup: () => cleanupProject(tempDir)
    };
  } catch (error) {
    throw new Error(`Failed to create temporary directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Safely removes a temporary project directory and all its contents
 * 
 * @param tempDir - Absolute path to the temporary directory to remove
 * @throws {Error} When cleanup fails or path validation fails
 * 
 * @example
 * ```typescript
 * await cleanupProject('/tmp/project_1234567890_abcdef');
 * ```
 */
export async function cleanupProject(tempDir: string): Promise<void> {
  if (!tempDir || typeof tempDir !== 'string') {
    throw new Error('Invalid tempDir provided for cleanup');
  }

  // Basic safety check: ensure we're only cleaning temp directories
  const systemTempDir = tmpdir();
  if (!tempDir.startsWith(systemTempDir)) {
    throw new Error(`Refusing to clean directory outside temp folder: ${tempDir}`);
  }

  try {
    // Check if directory exists before attempting to remove
    const stats = await fs.stat(tempDir).catch(() => null);
    if (!stats) {
      // Directory doesn't exist, nothing to clean
      return;
    }

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${tempDir}`);
    }

    // Remove the directory and all its contents
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to cleanup directory ${tempDir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a basic Rust project structure with Cargo.toml and lib.rs
 * 
 * @param tempDir - The temporary directory to create the project in
 * @param rustCode - The Rust code to write to lib.rs
 * @throws {Error} When file creation fails
 */
export async function createRustProject(tempDir: string, rustCode: string): Promise<void> {
  if (!tempDir || typeof tempDir !== 'string') {
    throw new Error('Invalid tempDir provided');
  }

  if (!rustCode || typeof rustCode !== 'string') {
    throw new Error('Invalid rustCode provided');
  }

  try {
    // Create Cargo.toml for Soroban contract
    const cargoToml = `[package]
name = "temp-contract"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "21"

[dev-dependencies]
soroban-sdk = { version = "21", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true
`;

    // Create src directory
    const srcDir = join(tempDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    // Write Cargo.toml
    await fs.writeFile(join(tempDir, 'Cargo.toml'), cargoToml, 'utf8');

    // Write lib.rs
    await fs.writeFile(join(srcDir, 'lib.rs'), rustCode, 'utf8');

  } catch (error) {
    throw new Error(`Failed to create Rust project structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}