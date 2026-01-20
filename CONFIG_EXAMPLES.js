/**
 * CSRF Configuration Examples for Strapi
 * 
 * Copy the relevant sections to your config files
 */

// =====================================================
// File: config/middlewares.js
// =====================================================
/*

module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      keepHeaderOnError: true,
      credentials: true,
      maxAge: 86400,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  'strapi::favicon',
  'strapi::public',
  // CSRF Protection Middleware (must come after session/cookies middleware)
  'api::middlewares.csrf',
];

*/

// =====================================================
// File: .env (Environment Variables)
// =====================================================
/*

# Core Settings
NODE_ENV=production
STRAPI_HOST=0.0.0.0
STRAPI_PORT=1337

# Database (example with PostgreSQL)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=onlinetechspot
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-password

# JWT & Sessions
JWT_SECRET=your-jwt-secret-key-min-32-chars
SESSION_SECRET=your-session-secret-key-min-32-chars
ADMIN_JWT_SECRET=your-admin-jwt-secret

# CSRF Configuration
CSRF_ENABLED=true
CSRF_SECRET=your-csrf-secret-key-min-32-chars

# Cookie Configuration
COOKIE_SECURE=true          # Only send over HTTPS
COOKIE_HTTP_ONLY=true       # Prevent JavaScript access
COOKIE_SAME_SITE=Strict     # Only send for same-site requests
COOKIE_SIGNED=true          # Sign cookies to prevent tampering

# Frontend URL
FRONTEND_URL=http://localhost:8080
VITE_SERVER=localhost:1337

# Security
ADMIN_SSL=true              # Use HTTPS for admin panel
ENABLE_RATE_LIMIT=true
ENABLE_HELMET=true

*/

// =====================================================
// File: config/env/production/server.js
// =====================================================
/*

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', []),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  http: {
    maxRequestSize: '200mb',
  },
  
  // Session configuration
  session: {
    defaultSession: {
      rolling: true,
      renew: true,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        signed: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
  },
});

*/

// =====================================================
// File: config/server.js (Development)
// =====================================================
/*

module.exports = ({ env }) => ({
  host: env('HOST', 'localhost'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['testKey1', 'testKey2']),
  },
});

*/

// =====================================================
// File: .env.example (Template for developers)
// =====================================================
/*

# Core Configuration
NODE_ENV=development
STRAPI_HOST=localhost
STRAPI_PORT=1337

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Secrets (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ADMIN_JWT_SECRET=your-admin-secret-here
CSRF_SECRET=your-csrf-secret-here

# Frontend
FRONTEND_URL=http://localhost:8080
VITE_SERVER=localhost:1337

# Cookies
COOKIE_SECURE=false         # false for development
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=Lax        # or Strict
COOKIE_SIGNED=true

# Features
WEBHOOKS_POPULATE_RELATIONS=false
ENABLE_RATE_LIMIT=false
ENABLE_HELMET=true

*/

// =====================================================
// Generate Secret Keys Script
// =====================================================
/*

// Run this once to generate secure secrets:
// node scripts/generate-secrets.js

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

const envFile = path.join(__dirname, '..', '.env');

const secrets = {
  JWT_SECRET: generateSecret(32),
  SESSION_SECRET: generateSecret(32),
  ADMIN_JWT_SECRET: generateSecret(32),
  CSRF_SECRET: generateSecret(32),
};

const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

console.log('Generated Secrets:');
console.log(envContent);

// Optional: Write to .env
// fs.appendFileSync(envFile, '\n' + envContent);
// console.log('Secrets appended to .env');

*/

// =====================================================
// CORS Configuration Presets
// =====================================================
/*

// Localhost Development
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
  },
}

// Production with Multiple Domains
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: [
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'https://app.yourdomain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 3600,
  },
}

// Environment-based
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    methods: process.env.CORS_METHODS?.split(',') || 
             ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers: process.env.CORS_HEADERS?.split(',') || 
             ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: parseInt(process.env.CORS_MAX_AGE || '3600'),
  },
}

*/

// =====================================================
// Security Headers Configuration
// =====================================================
/*

// Add to strapi::security in middlewares.js
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https:'],
        'img-src': ["'self'", 'data:', 'https:'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
}

*/

// =====================================================
// Rate Limiting (Optional)
// =====================================================
/*

// Add to middlewares.js
{
  name: 'strapi::poweredBy',
  config: {
    enabled: false,
  },
},
{
  resolve: 'strapi-middleware-rate-limit',
  config: {
    enabled: true,
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests, please try again later',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (ctx) => {
      // Use IP address as key
      return ctx.ip || ctx.request.ip;
    },
    // Skip rate limiting for specific paths
    skip: (ctx) => {
      return ['/admin', '/api/users/me'].includes(ctx.path);
    },
  },
},

*/

// =====================================================
// Helmet Security Middleware
// =====================================================
/*

// Helmet is usually included in strapi::security
// You can customize it:

{
  name: 'strapi::security',
  config: {
    helmet: {
      contentSecurityPolicy: {
        useDefaults: true,
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
      frameGuard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      xssFilter: {
        mode: 'block',
      },
    },
  },
}

*/

// =====================================================
// Testing CSRF in Development
// =====================================================
/*

// Test script: test-csrf.js

const axios = require('axios');

const API_URL = 'http://localhost:1337/api';
let csrfToken = null;
let cookies = null;

async function testCSRF() {
  try {
    // Step 1: Get CSRF token from frontend (simulated)
    csrfToken = require('crypto').randomBytes(32).toString('hex');
    console.log('Generated CSRF Token:', csrfToken);

    // Step 2: Make protected request
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        data: {
          customer_name: 'Test User',
          customer_email: 'test@example.com',
        },
      },
      {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    console.log('✅ CSRF Test Passed:', response.status);
    console.log('Response:', response.data);

  } catch (error) {
    if (error.response?.status === 403) {
      console.error('❌ CSRF Validation Failed:', error.response.data);
    } else {
      console.error('❌ Test Error:', error.message);
    }
  }
}

testCSRF();

*/

module.exports = {
  // This file is for documentation only
  // Copy the relevant sections to your actual config files
};
