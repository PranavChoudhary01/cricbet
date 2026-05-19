const rateLimit = require('express-rate-limit');

// General API limit
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, try after 15 minutes' },
});

// Bet placement — stricter (1 bet per second)
exports.betLimiter = rateLimit({
  windowMs: 1000,
  max: 1,
  message: { error: 'Please wait before placing another bet' },
});

// Auth routes
exports.authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts' },
});
