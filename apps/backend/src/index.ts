import express from 'express';
import { setupProject, getSanitizedDirName, createRustProject } from './utils/fileManager';

const app = express();
app.use(express.json());

app.get('/', (_, res) =>
  res.send('Hello from Backend!' + '<br>' + 'The best online soroban compiler is coming...')
);

// Test endpoint for fileManager functionality
app.post('/api/test-filemanager', async (req, res) => {
  try {
    const {
      baseName = 'test-project',
      rustCode = 'pub fn hello() -> &\'static str { "Hello, Soroban!" }',
    } = req.body;

    // Test sanitization
    const sanitized = getSanitizedDirName(baseName);

    // Test project setup
    const project = await setupProject({ baseName });

    // Test Rust project creation
    await createRustProject(project.tempDir, rustCode);

    // Success response
    const response = {
      success: true,
      sanitizedName: sanitized,
      tempDir: project.tempDir,
      message: 'FileManager test completed successfully - Rust project created and cleaned up',
    };

    // Cleanup
    await project.cleanup();

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));
