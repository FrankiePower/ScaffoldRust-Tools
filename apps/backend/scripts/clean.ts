import { fileManager } from '../src/utils/fileManager';

async function main() {
  const customPath = process.argv[2];
  
  try {
    await fileManager.cleanupProject(customPath);
    console.log(' Cleanup completed successfully');
  } catch (error) {
    console.error(' Cleanup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();