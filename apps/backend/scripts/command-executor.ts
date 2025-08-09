import { executeCommand } from "../src/utils/commandExecutor";

interface CommandError extends Error {
  stderr?: string;
  stdout?: string;
  code?: number;
}

async function main() {
  try {
    console.log('Testing command executor...\n');

    // Test 1: Simple successful command
    console.log('Test 1: Running "echo hello world"');
    const result1 = await executeCommand('echo "hello world"');
    console.log('Success:', result1, '\n');

    // Test 2: Command with error
    console.log('Test 2: Running "ls non-existent-file"');
    try {
      await executeCommand('ls non-existent-file');
    } catch (error: unknown) {
      const err = error as CommandError;
      console.log('Error caught as expected:');
      console.log('Message:', err.message);
      if (err.stderr) console.log('Stderr:', err.stderr);
      console.log('');
    }

    // Test 3: Command with timeout (using macOS compatible command)
    console.log('Test 3: Running "ping -c 5 127.0.0.1" with 1000ms timeout');
    try {
      await executeCommand('ping -c 5 127.0.0.1', 1000);
    } catch (error: unknown) {
      const err = error as CommandError;
      console.log('Timeout caught as expected:');
      console.log('Message:', err.message);
      console.log('');
    }

    // Test 4: Successful command sequence
    console.log('Test 4: Running "date && whoami"');
    const result4 = await executeCommand('date && whoami');
    console.log('Success:', result4);

    console.log('\nAll tests completed successfully!');

  } catch (error: unknown) {
    const err = error as CommandError;
    console.error('\nUnexpected error in test script:');
    console.error('Message:', err.message);
    if (err.stderr) console.error('Stderr:', err.stderr);
    if (err.stdout) console.error('Stdout:', err.stdout);
    process.exit(1);
  }
}

main();