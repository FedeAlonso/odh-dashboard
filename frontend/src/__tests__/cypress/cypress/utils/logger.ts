import * as fs from 'fs';
import * as path from 'path';

export const LogLevel = {
  // eslint-disable-next-line no-console
  INFO: { value: 'info', method: console.log },
  // eslint-disable-next-line no-console
  ERROR: { value: 'error', method: console.error },
  // eslint-disable-next-line no-console
  TABLE: { value: 'table', method: console.table },
} as const;

type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

// Create logs directory at project root
const LOGS_DIR = path.join(process.cwd(), 'results', 'e2e', 'logs');

// Debug: Log the current working directory and logs directory
// eslint-disable-next-line no-console
console.log('Current working directory:', process.cwd());
// eslint-disable-next-line no-console
console.log('Logs directory:', LOGS_DIR);

if (!fs.existsSync(LOGS_DIR)) {
  try {
    // eslint-disable-next-line no-console
    console.log('Creating logs directory...');
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    // eslint-disable-next-line no-console
    console.log('Logs directory created successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create logs directory:', error);
  }
}

/**
 * Helper function to handle logging to console and file
 * @param level - Log level from LogLevel object
 * @param message - Message to log
 * @param testFile - The test file name (e.g. 'testSingleModelAdminCreation.cy.ts')
 * @returns null
 */
export function logToConsole(level: LogLevelType, message: string, testFile?: string): null {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.value.toUpperCase()}] ${message}\n`;

  // Write to file if testFile is provided
  if (testFile) {
    // Remove .cy.ts extension and create log file
    const logFileName = testFile.replace(/\.cy\.ts$/, '.log');
    const logFile = path.join(LOGS_DIR, logFileName);
    try {
      // eslint-disable-next-line no-console
      console.log('Writing to log file:', logFile);
      fs.appendFileSync(logFile, formattedMessage);
      // eslint-disable-next-line no-console
      console.log('Successfully wrote to log file');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to write to log file:', error);
    }
  }

  // Always log to console
  level.method(formattedMessage.trim());

  return null;
}
