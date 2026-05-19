const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Define custom console log formatting
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json() // Cloud-native JSON format for file indexing
  ),
  transports: [
    // Output error-level logs to error.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'error.log'), 
      level: 'error' 
    }),
    // Output all security/access events to security.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'security.log') 
    })
  ]
});

// If in development/staging, add beautifully formatted console output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    )
  }));
}

/**
 * Log Authentication Attempts (Success / Failure)
 * @param {string} email 
 * @param {boolean} success 
 * @param {string|null} role 
 * @param {object} details 
 */
const logAuthAttempt = (email, success, role, details = {}) => {
  const message = `[Auth Attempt] ${success ? 'SUCCESS' : 'FAILED'} - User: ${email} ${role ? `(${role})` : ''}`;
  logger.info(message, {
    event: 'auth_attempt',
    email,
    success,
    role,
    ...details
  });
};

/**
 * Log API Errors
 * @param {object} req 
 * @param {Error} err 
 */
const logApiError = (req, err) => {
  const message = `[API Error] ${req.method} ${req.originalUrl} - ${err.message}`;
  logger.error(message, {
    event: 'api_error',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.headers['x-forwarded-for'],
    stack: err.stack,
    ...err
  });
};

/**
 * Log Suspicious/Unusual Activity (e.g. rate limits, IDOR attempts)
 * @param {string} type 
 * @param {object} req 
 * @param {object} details 
 */
const logSuspiciousActivity = (type, req, details = {}) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const message = `[SUSPICIOUS ACTIVITY] Type: ${type} - Path: ${req.originalUrl} - IP: ${clientIp}`;
  logger.warn(message, {
    event: 'suspicious_activity',
    type,
    method: req.method,
    url: req.originalUrl,
    ip: clientIp,
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'anonymous',
    ...details
  });
};

module.exports = {
  logger,
  logAuthAttempt,
  logApiError,
  logSuspiciousActivity
};
