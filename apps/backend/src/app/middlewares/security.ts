import helmet from 'helmet';
import session from 'express-session';
import { Express } from 'express';

/**
 * Configure security middleware for the application
 * @param app Express application
 */
export const configureSecurityMiddleware = (app: Express) => {
  // Set security HTTP headers - less restrictive in development
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP in development
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false
      })
    );
  }
  
  // Content Security Policy - more relaxed in development
  if (process.env.NODE_ENV === 'production') {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", "https://*.suiet.app"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      })
    );
  } else {
    // More relaxed CSP for development
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:*"],
          imgSrc: ["'self'", "data:", "blob:", "http://localhost:*"],
          connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*", "https://*.suiet.app", "ws://localhost:*"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      })
    );
  }
  
  // Configure session management
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is required');
  }
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? cookieDomain || undefined : undefined
      }
    })
  );
  
  // XSS Protection
  app.use(helmet.xssFilter());
  
  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));
  
  // Prevent MIME type sniffing
  app.use(helmet.noSniff());
  
  // Hide X-Powered-By header
  app.use(helmet.hidePoweredBy());
  
  // HTTP Strict Transport Security
  app.use(
    helmet.hsts({
      maxAge: 15552000, // 180 days in seconds
      includeSubDomains: true,
      preload: true,
    })
  );
};
