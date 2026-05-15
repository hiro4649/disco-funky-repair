import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import moment from 'moment';

// In-memory store for illustration draw rate limiting
const illustrationDrawTimestamps = new Map<number, number>();

// Rate limiter for illustration drawing (5 seconds per user)
export const illustrationDrawRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });
    }

    const now = moment.utc().valueOf();
    const lastDrawTime = illustrationDrawTimestamps.get(userId);
    
    if (lastDrawTime && (now - lastDrawTime) < 2000) {
        return res.status(429).json({
            success: false,
            error: 'Illegal Request',
            message: 'You are attempting an illegal operation.',
        });
    }

    // Update the timestamp for this user
    illustrationDrawTimestamps.set(userId, now);
    
    next();
};

// Clean up old timestamps periodically (every 10 minutes)
setInterval(() => {
    const now = moment.utc().valueOf();
    const tenMinutesAgo = now - (10 * 60 * 1000);
    
    for (const [userId, timestamp] of illustrationDrawTimestamps.entries()) {
        if (timestamp < tenMinutesAgo) {
            illustrationDrawTimestamps.delete(userId);
        }
    }
}, 10 * 60 * 1000); // Run every 10 minutes

// General rate limiter for all requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Strict rate limiter for auth-related endpoints to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

// Medium rate limiter for sensitive endpoints
export const sensitiveApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded, please try again later.' },
}); 