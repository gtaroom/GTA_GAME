import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Helper function to get client IP
const getClientIp = (req: any) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return Array.isArray(forwardedFor) 
      ? forwardedFor[0].split(',')[0].trim()
      : forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// Auth rate limiter (login, register, password reset)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    logger.info('Rate Limiter - Auth Request', { ip, path: req.path });
    return ip;
  },
  handler: (req, res) => {
    logger.warn('Rate Limit Exceeded - Auth', {
      ip: getClientIp(req),
      path: req.path
    });
    res.status(429).json({ message: "Too many login attempts, please try again after 15 minutes" });
  }
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    logger.info('Rate Limiter - API Request', { ip, path: req.path });
    return ip;
  },
  handler: (req, res) => {
    logger.warn('Rate Limit Exceeded - API', {
      ip: getClientIp(req),
      path: req.path
    });
    res.status(429).json({ message: "Too many requests, please try again later" });
  }
});

// Sensitive API rate limiter (profile updates, password changes)
export const sensitiveApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, 
  message: { message: "Too many requests to sensitive endpoint, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bonus claim rate limiter
export const bonusLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, 
  message: { message: "Daily bonus limit reached, please try again tomorrow" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin API rate limiter
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { message: "Too many admin requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Game API rate limiter
export const gameLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, 
  message: { message: "Too many game requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
}); 