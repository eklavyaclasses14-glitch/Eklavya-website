const rateLimit = require('express-rate-limit');
const { logSuspiciousActivity } = require('../utils/logger');

/**
 * Global Scraping & Bot Protection
 * Applied on all /api/* routes to block automated scrapers or DoS hammered queries.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSuspiciousActivity('GLOBAL_RATE_LIMIT_EXCEEDED', req, { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Authentication Rate Limiter
 * Applied on auth endpoints to prevent automated credential brute-forcing.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSuspiciousActivity('LOGIN_RATE_LIMIT_EXCEEDED', req, { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Password Reset Flow Limiter
 * Restricts reset-token bombings.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per window
  message: { error: 'Too many password reset requests, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSuspiciousActivity('PASSWORD_RESET_RATE_LIMIT_EXCEEDED', req, { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Account Creation Rate Limiter
 * Protects registration paths from automated form-spammers and database injection flooding.
 */
const accountCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 account creations per window
  message: { error: 'Too many account creation attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSuspiciousActivity('ACCOUNT_CREATION_RATE_LIMIT_EXCEEDED', req, { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * AI Generation Rate Limiter
 * Proactively configured to protect future computationally heavy and expensive AI API gateways from misuse.
 */
const aiGenerationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 generations per minute
  message: { error: 'Too many AI generation requests. Please wait a moment before sending more.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSuspiciousActivity('AI_GENERATION_RATE_LIMIT_EXCEEDED', req, { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  accountCreationLimiter,
  aiGenerationLimiter
};
