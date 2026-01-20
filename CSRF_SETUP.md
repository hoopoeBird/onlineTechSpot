# CSRF Protection - Setup Guide

## Overview

Your frontend has **complete CSRF protection** implemented. This guide covers everything you need.

---

## ✅ What's Done (Frontend)

| Component | Status |
|-----------|--------|
| Token generation | ✅ src/lib/csrf.ts |
| API client with CSRF | ✅ src/lib/api-client.ts |
| React hook | ✅ src/hooks/useCSRF.ts |
| AuthContext updated | ✅ Uses CSRF |
| Checkout page updated | ✅ Uses CSRF |
| Code examples | ✅ src/lib/CSRF_EXAMPLES.tsx |

---

## 🚀 Frontend Usage (Already Working)

```tsx
import { apiPost, apiPut, apiDelete } from "@/lib/api-client";

// CSRF token automatically included!
const response = await apiPost("/api/orders", {
  customer_name: "John Doe",
  email: "john@example.com"
});
```

That's it. All POST/PUT/DELETE requests are protected.

---

## 🔧 Backend Setup (TypeScript Strapi)

### 1. Copy Middleware
Copy `src/middlewares/csrf.ts` to your Strapi backend at `src/middlewares/csrf.ts`

### 2. Register in `config/middlewares.ts`

```typescript
export default [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'csrf',  // ← Add this line
];
```

### 3. Environment Variables (`.env`)

```env
CSRF_SECRET=your-32-char-hex-key-here-1234567890123456
FRONTEND_URL=http://localhost:8080
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=Strict
```

---

## 🧪 Testing

### Frontend Test
```bash
# Open browser console
localStorage.getItem('X-CSRF-Token')
# Should show: a1b2c3d4e5f6789...64-char-hex-string
```

### Backend Test
```bash
TOKEN="a1b2c3d4e5f6789a1b2c3d4e5f6789a1b2c3d4e5f6789a1b2c3d4e5f6789a1b"

# Test valid token
curl -X POST http://localhost:1337/api/orders \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Cookie: csrf-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"customer_name":"Test"}}'
# Expected: 200 OK

# Test invalid token
curl -X POST http://localhost:1337/api/orders \
  -H "X-CSRF-Token: invalid" \
  -H "Content-Type: application/json"
# Expected: 403 Forbidden
```

---

## 📋 How It Works

1. **App loads** → Token generated automatically (32 random bytes, stored in localStorage)
2. **POST/PUT/DELETE request** → API client adds `X-CSRF-Token` header + cookie
3. **Backend receives** → Middleware validates token matches in header AND cookie
4. **Valid?** → Request continues
5. **Invalid?** → Returns 403 Forbidden

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Token not sent in requests | Use `apiPost/apiPut/apiDelete` not `fetch()` |
| 403 errors from backend | Check middleware registered in config/middlewares.ts |
| CORS errors | Ensure `X-CSRF-Token` is in allowed headers |
| Token missing | Check localStorage enabled in browser |

---

## 📁 Key Files Reference

**Frontend:**
- `src/lib/csrf.ts` - Token utilities
- `src/lib/api-client.ts` - HTTP client with CSRF
- `src/hooks/useCSRF.ts` - React hook
- `src/lib/CSRF_EXAMPLES.tsx` - Code examples (8 patterns)

**Backend:**
- `src/middlewares/csrf.ts` - CSRF middleware (copy this)
- `config/middlewares.ts` - Register middleware here
- `.env` - Add environment variables

---

## 💡 Code Examples

See `src/lib/CSRF_EXAMPLES.tsx` for:
- Simple form submission
- Protected DELETE
- Protected UPDATE with auth header
- Protected POST with custom headers
- Manual token management
- Fetch with error handling
- Batch operations
- File uploads

---

## ✨ That's All!

Frontend: 100% done ✅
Backend: 30 minutes to setup 🔧

Follow the 3 backend setup steps above and you're done!

---

**Need more detail?** Check `CONFIG_EXAMPLES.js` for additional configuration options.
