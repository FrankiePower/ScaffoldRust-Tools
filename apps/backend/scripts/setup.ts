import { fileManager } from '../src/utils/fileManager';

async function main() {
  try {
    const projectPath = await fileManager.setupProject();
    console.log('Project created at:', projectPath);
    console.log('\nTo clean up later, run:');
    console.log('bun run clean');
    console.log('or to clean a specific path:');
    console.log('bun run clean -- /path/to/project');
  } catch (error) {
    console.error('Setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();