import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const getLogFilePath = (level: string) => {
    const date = new Date().toISOString().split('T')[0]; // Get current date YYYY-MM-DD
    return path.join(logsDir, `${level}-${date}.log`);
};

const writeToFile = (level: string, message: string, meta: any[]) => {
    const logFilePath = getLogFilePath(level);
    const timestamp = new Date().toISOString();
    const metaString = meta.length > 0 ? JSON.stringify(meta) : '';
    const logEntry = `[${timestamp}] ${message} ${metaString}\n`;
    
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

/**
 * Simple logger utility
 */
export const logger = {
  info: (message: string, ...meta: any[]) => {
    const logMessage = `[INFO] ${message}`;
    console.log(logMessage, ...meta);
    writeToFile('info', logMessage, meta);
  },
  
  error: (message: string, ...meta: any[]) => {
    const logMessage = `[ERROR] ${message}`;
    console.error(logMessage, ...meta);
    writeToFile('error', logMessage, meta);
  },
  
  warn: (message: string, ...meta: any[]) => {
    const logMessage = `[WARN] ${message}`;
    console.warn(logMessage, ...meta);
    writeToFile('warn', logMessage, meta);
  },
  
  debug: (message: string, ...meta: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = `[DEBUG] ${message}`;
      console.debug(logMessage, ...meta);
      writeToFile('debug', logMessage, meta);
    }
  }
}; 