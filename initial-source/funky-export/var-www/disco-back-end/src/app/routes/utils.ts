import { Request, Response, NextFunction } from 'express';

// Wrapper function to handle async route handlers with proper typing
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error('Route handler error:', error);
            next(error);
        });
    }; 