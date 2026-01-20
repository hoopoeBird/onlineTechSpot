/**
 * CSRF Protection Middleware for Strapi (TypeScript)
 * 
 * Copy this file to: src/middlewares/csrf.ts
 * Then register it in config/middlewares.ts as 'csrf'
 */

import { Core } from '@strapi/strapi';
import { DefaultContext, DefaultState, Next } from 'koa';

interface StrapiContext extends DefaultContext {
  ip?: string;
  request?: {
    url?: string;
  };
  throw: (status: number, message: string) => void;
}

interface StrapiState extends DefaultState {
  [key: string]: any;
}

type MiddlewareFactory = (strapi: Core.Strapi) => (ctx: StrapiContext, next: Next) => Promise<void>;

/**
 * Main CSRF Protection Middleware
 * Double Submit Cookie Pattern
 */
const csrfMiddleware: MiddlewareFactory = (strapi: Core.Strapi) => {
  return async (ctx: StrapiContext, next: Next): Promise<void> => {
    const { method, headers, cookies } = ctx;

    // Define safe methods that don't need CSRF protection
    const SAFE_METHODS: string[] = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    // Define public routes that bypass CSRF (e.g., login, register)
    const PUBLIC_ROUTES: string[] = [
      '/api/auth/local',
      '/api/auth/local/register',
      '/api/auth/callback',
      '/api/csrf-token', // If you have a token endpoint
    ];

    // Check if route should be protected
    const isPublicRoute: boolean = PUBLIC_ROUTES.some((route: string) =>
      ctx.request?.url?.includes(route)
    );

    // Skip CSRF check for safe methods or public routes
    if (SAFE_METHODS.includes(method) || isPublicRoute) {
      return next();
    }

    try {
      // Extract CSRF token from request header
      const headerToken: string | undefined = headers['x-csrf-token'] as string;

      // Extract CSRF token from cookies
      const cookieToken: string | undefined = cookies.get('csrf-token');

      // Log for debugging (remove in production)
      strapi.log.debug('CSRF Check:', {
        headerToken: headerToken ? headerToken.substring(0, 10) + '...' : 'missing',
        cookieToken: cookieToken ? cookieToken.substring(0, 10) + '...' : 'missing',
        method,
        url: ctx.request?.url,
      });

      // Validate that tokens exist and match
      if (!headerToken) {
        return ctx.throw(403, 'CSRF Token missing in header (X-CSRF-Token)');
      }

      if (!cookieToken) {
        return ctx.throw(403, 'CSRF Token missing in cookie (csrf-token)');
      }

      // Compare header token with cookie token
      if (headerToken !== cookieToken) {
        strapi.log.warn('CSRF Token mismatch:', {
          ip: ctx.ip,
          method,
          url: ctx.request?.url,
        });
        return ctx.throw(403, 'CSRF Token validation failed (token mismatch)');
      }

      // Validate token format (should be 64-character hex string from 32 bytes)
      if (!/^[a-f0-9]{64}$/.test(headerToken)) {
        return ctx.throw(403, 'CSRF Token invalid format');
      }

      // Token is valid, continue to next middleware
      await next();

    } catch (error) {
      // Don't expose detailed error messages in production
      const message: string = process.env.NODE_ENV === 'production'
        ? 'CSRF validation failed'
        : (error as Error).message;

      ctx.throw(403, message);
    }
  };
};

/**
 * ALTERNATIVE: Session-based CSRF (if you prefer session storage)
 * 
 * This version stores tokens in the user's session instead of cookies
 */
const sessionBasedMiddleware: MiddlewareFactory = (strapi: Core.Strapi) => {
  return async (ctx: StrapiContext, next: Next): Promise<void> => {
    const { method, headers } = ctx;

    const SAFE_METHODS: string[] = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    if (SAFE_METHODS.includes(method)) {
      return next();
    }

    try {
      const headerToken: string | undefined = headers['x-csrf-token'] as string;
      const session: any = (ctx as any).session;
      const sessionToken: string | undefined = session?.csrfToken;

      if (!headerToken || !sessionToken) {
        return ctx.throw(403, 'CSRF Token missing');
      }

      if (headerToken !== sessionToken) {
        return ctx.throw(403, 'CSRF Token validation failed');
      }

      // Optionally rotate token after use
      if (session) {
        const crypto = require('crypto');
        session.csrfToken = crypto.randomBytes(32).toString('hex');
      }

      await next();

    } catch (error) {
      ctx.throw(403, (error as Error).message);
    }
  };
};

/**
 * ALTERNATIVE: Double Submit Cookie with signature verification
 * 
 * This version signs the token to prevent tampering
 */
const signedCookieMiddleware: MiddlewareFactory = (strapi: Core.Strapi) => {
  return async (ctx: StrapiContext, next: Next): Promise<void> => {
    const crypto = require('crypto');
    const { method, headers, cookies } = ctx;

    const SAFE_METHODS: string[] = ['GET', 'HEAD', 'OPTIONS'];

    if (SAFE_METHODS.includes(method)) {
      return next();
    }

    try {
      const headerToken: string | undefined = headers['x-csrf-token'] as string;
      const cookieToken: string | undefined = cookies.get('csrf-token');

      if (!headerToken || !cookieToken) {
        return ctx.throw(403, 'CSRF Token missing');
      }

      // Verify signed token
      const hmac = crypto.createHmac('sha256', process.env.CSRF_SECRET || 'your-secret');
      hmac.update(cookieToken);
      const expectedSignature: string = hmac.digest('hex');

      // Extract signature from header (format: token.signature)
      const [token, signature]: string[] = headerToken.split('.');

      if (!signature || signature !== expectedSignature) {
        return ctx.throw(403, 'CSRF Token signature invalid');
      }

      if (token !== cookieToken) {
        return ctx.throw(403, 'CSRF Token mismatch');
      }

      await next();

    } catch (error) {
      ctx.throw(403, (error as Error).message);
    }
  };
};

export default csrfMiddleware;
export { sessionBasedMiddleware, signedCookieMiddleware };

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Copy this file to: src/api/middlewares/csrf.js
 * 
 * 2. Register in config/middlewares.js:
 *    module.exports = [
 *      'strapi::errors',
 *      'strapi::security',
 *      'strapi::cors',
 *      'strapi::poweredBy',
 *      'strapi::logger',
 *      'strapi::query',
 *      'strapi::body',
 *      'strapi::session',
 *      'strapi::favicon',
 *      'strapi::public',
 *      'csrf',  // <-- Add this line
 *    ];
 * 
 * 3. Update CORS in config/middlewares.js:
 *    {
 *      name: 'strapi::cors',
 *      config: {
 *        enabled: true,
 *        origin: ['http://localhost:8080', 'https://yourdomain.com'],
 *        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
 *        headers: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
 *        credentials: true,
 *      },
 *    }
 * 
 * 4. Add environment variables to .env:
 *    CSRF_ENABLED=true
 *    CSRF_SECRET=your-secret-key
 *    NODE_ENV=production
 *    COOKIE_SECURE=true
 *    COOKIE_HTTP_ONLY=true
 * 
 * 5. Test with:
 *    curl -X POST http://localhost:1337/api/endpoint \
 *      -H "X-CSRF-Token: your-token" \
 *      -H "Cookie: csrf-token=your-token" \
 *      -H "Content-Type: application/json" \
 *      -d '{"data": "test"}'
 */
