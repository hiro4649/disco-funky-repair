import { Request, Response, NextFunction } from 'express';
import { safeLogError } from '../utils/safeLogger';

// Wrapper function to handle async route handlers with proper typing
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            safeLogError('route_handler', error, {
                route: req.route?.path || req.path,
                method: req.method,
                hasUser: Boolean(req.user)
            });
            next(error);
        });
    };
