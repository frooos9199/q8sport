// Q8SportApp Logger - Production Safe Console
// This file provides console logging that is automatically disabled in production

const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Errors are always logged
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// Disable all console methods in production
if (!isDevelopment) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
  // Keep console.error for critical issues
}

export default logger;
