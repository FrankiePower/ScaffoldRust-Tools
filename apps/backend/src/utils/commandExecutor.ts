import { spawn, type SpawnOptionsWithoutStdio } from 'child_process';

const DEFAULT_TIMEOUT = 30000;

/**
 * Executes a shell command securely with a timeout
 * @param command The command to execute
 * @param timeout Maximum execution time in milliseconds (default: 30000)
 * @returns Promise that resolves with the command output
 * @throws Error with stderr content if command fails or times out
 */
export async function executeCommand(
  command: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<string> {
  // Validate inputs
  if (typeof command !== 'string' || command.trim() === '') {
    throw new Error('Command must be a non-empty string');
  }

  if (typeof timeout !== 'number' || timeout <= 0) {
    throw new Error('Timeout must be a positive number');
  }

  const options: SpawnOptionsWithoutStdio = {
    shell: '/bin/bash',
    env: { ...process.env },
  };

  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-c', command], options);

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout;

    // Set up timeout
    if (timeout !== Infinity) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);

      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const error = new Error(
          stderr.trim() || `Command failed with exit code ${code}`
        );
        (error as any).stderr = stderr.trim();
        (error as any).stdout = stdout.trim();
        (error as any).code = code;
        reject(error);
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}