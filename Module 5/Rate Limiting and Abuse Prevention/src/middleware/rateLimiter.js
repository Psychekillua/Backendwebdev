'use strict';

const { rateLimit } = require('express-rate-limit');

const windowMs = 15 * 60 * 1000;

const rateLimiter = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000);

    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});

// Use a Redis-backed store in multi-instance deployments; the default memory store is process-local.
module.exports = rateLimiter;
