import { promises as fs } from 'fs';
import path from 'path';

const DEFAULT_CARGO_TOML = `[package]
name = "temp_project"
version = "0.1.0"
edition = "2021"

[lib]
name = "temp_project"
path = "src/lib.rs"
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "21.2.0"
`;

export const fileManager = {
    async setupProject(): Promise<string> {
        const tempDir = path.join(__dirname, '../../temp', `project_${Date.now()}`);

        const rustCode = `#![no_std]
use soroban_sdk::{contractimpl, Env};

pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, name: String) -> String {
        format!("Hello, {}!", name)
    }
}`;

        try {
            await fs.mkdir(tempDir, { recursive: true });
            const srcDir = path.join(tempDir, 'src');
            await fs.mkdir(srcDir);
            await fs.writeFile(path.join(tempDir, 'Cargo.toml'), DEFAULT_CARGO_TOML);
            await fs.writeFile(path.join(srcDir, 'lib.rs'), rustCode);
            return tempDir;
        } catch (error) {
            throw new Error(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

    async cleanupProject(projectPath?: string): Promise<void> {
        const tempDir = projectPath || path.join(__dirname, '../../temp');

        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};

export type FileManager = typeof fileManager;