import express from 'express';
import { FileManager } from './utils/fileManager';

const app = express();
app.use(express.json());

app.get('/', (_, res) =>
  res.send('Hello from Backend!' + '<br>' + 'The best online soroban compiler is coming...')
);

// Test endpoint for fileManager functionality
app.post('/api/test-filemanager', async (req, res) => {
  try {
    const {
      projectName = 'test-project',
      code = 'pub fn hello() -> &\'static str { "Hello, Soroban!" }',
    } = req.body;

    // Test project creation using FileManager class
    const project = await FileManager.createProject({
      code,
      projectName,
    });

    // Success response
    const response = {
      success: true,
      projectPath: project.projectPath,
      sourcePath: project.sourcePath,
      cargoPath: project.cargoPath,
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
