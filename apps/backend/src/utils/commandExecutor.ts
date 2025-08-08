import { spawn, ChildProcess } from 'child_process';

/**
 * Result of a command execution
 */
export interface CommandResult {
  /** Exit code of the command */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error output */
  stderr: string;
  /** Whether the command was killed due to timeout */
  timedOut: boolean;
}

/**
 * Options for command execution
 */
export interface ExecuteOptions {
  /** Working directory for the command */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds (default: 30000ms = 30s) */
  timeout?: number;
}

/**
 * Error thrown when a command exceeds the timeout limit
 */
export class CommandTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Command exceeded time limit of ${timeout}ms`);
    this.name = 'CommandTimeoutError';
  }
}

/**
 * Executes a shell command with timeout enforcement
 *
 * @param command - The command to execute
 * @param args - Arguments for the command
 * @param options - Execution options including timeout
 * @returns Promise that resolves to CommandResult
 * @throws CommandTimeoutError if command exceeds timeout
 */
export async function executeCommand(
  command: string,
  args: string[] = [],
  options: ExecuteOptions = {}
): Promise<CommandResult> {
  const { cwd, env = process.env, timeout = 30000 } = options;

  return new Promise<CommandResult>((resolve, reject) => {
    // Buffer to collect stdout and stderr
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let childProcess: ChildProcess;

    try {
      // Spawn the child process
      childProcess = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        timedOut = true;

        // Kill the process if it's still running
        if (childProcess && !childProcess.killed) {
          childProcess.kill('SIGTERM');

          // Force kill after 5 seconds if SIGTERM doesn't work
          setTimeout(() => {
            if (childProcess && !childProcess.killed) {
              childProcess.kill('SIGKILL');
            }
          }, 5000);
        }

        reject(new CommandTimeoutError(timeout));
      }, timeout);

      // Collect stdout data
      if (childProcess.stdout) {
        childProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
      }

      // Collect stderr data
      if (childProcess.stderr) {
        childProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }

      // Handle process completion
      childProcess.on('close', (exitCode: number | null) => {
        clearTimeout(timeoutId);

        // Don't resolve if we already timed out
        if (timedOut) {
          return;
        }

        resolve({
          exitCode: exitCode ?? -1,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          timedOut: false,
        });
      });

      // Handle process errors
      childProcess.on('error', (error: Error) => {
        clearTimeout(timeoutId);

        // Don't reject if we already timed out
        if (timedOut) {
          return;
        }

        reject(error);
      });

      // Handle process being killed
      childProcess.on('exit', (code: number | null, signal: string | null) => {
        if (signal === 'SIGTERM' || signal === 'SIGKILL') {
          clearTimeout(timeoutId);

          // This was likely our timeout kill, but check the flag to be sure
          if (timedOut) {
            return; // The timeout handler will reject
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Executes a command with a specific timeout and returns the result
 * This is a convenience wrapper around executeCommand
 *
 * @param command - The command to execute
 * @param args - Arguments for the command
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that resolves to CommandResult
 */
export async function executeCommandWithTimeout(
  command: string,
  args: string[] = [],
  timeoutMs: number = 30000
): Promise<CommandResult> {
  return executeCommand(command, args, { timeout: timeoutMs });
}
