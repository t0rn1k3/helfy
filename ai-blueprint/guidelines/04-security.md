# 04 — Security

> Auth, passwords, tokens, input validation, rate limiting, CORS.
> Error handling: [03-error-handling.md](./03-error-handling.md)

---

## Authentication

| Token | Storage | Expiry | Transport |
| ----- | ------- | ------ | --------- |
| Access JWT | Memory (`authStore`) | 15 min | `Authorization: Bearer` header |
| Refresh JWT | httpOnly cookie | 7 days | Cookie (automatic) |

### Refresh token rotation

1. Client sends refresh cookie to `POST /auth/refresh`
2. Server validates, **invalidates old token hash** in `refresh_tokens` table
3. Server issues new access token (body) + new refresh token (cookie)
4. Parallel tab race: use token family ID — invalidate all siblings on rotation

### Refresh token storage

- Store **hashed** refresh token in DB (`refresh_tokens` table)
- Never store refresh tokens in localStorage or sessionStorage

### Auth endpoints

| Method | Path | Rate limit |
| ------ | ---- | ---------- |
| POST | `/auth/register` | 10 / 15 min |
| POST | `/auth/login` | 10 / 15 min |
| POST | `/auth/refresh` | 10 / 15 min |
| POST | `/auth/logout` | authenticated |
| POST | `/auth/logout-all` | authenticated |

---

## Password Security

```typescript
import argon2 from 'argon2';

// Hash on register / password change
const hash = await argon2.hash(password);

// Verify on login
const valid = await argon2.verify(hash, password);
```

- Use **argon2id** (argon2 default)
- Never log passwords
- Never return password hash in API responses
- Password change requires current password verification

---

## JWT Configuration

- Secrets: minimum 64 characters (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- Validated at startup via Zod in `backend/src/config/env.ts`
- Access payload: `{ sub: userId, role, iat, exp }` — no sensitive data

---

## Input Validation

- **Every mutating route** validated with Zod before controller
- Use `validate.middleware.ts` with shared schemas from `@helfy/shared`
- Sanitize string inputs (trim whitespace)
- Reject unknown fields with `.strict()` on object schemas

---

## SQL Injection Prevention

- Drizzle ORM parameterized queries only
- Never concatenate user input into SQL strings
- Never use `db.execute(sql`...${userInput}...`)`

---

## HTTP Security Headers

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## CORS

```typescript
// Whitelist only — from CORS_ORIGINS env var
// Development: http://localhost:5173
// credentials: true (required for refresh cookie)
```

---

## Rate Limiting

| Scope | Limit | Window |
| ----- | ----- | ------ |
| Auth routes | 10 requests | 15 min |
| All other routes | 100 requests | 15 min |

Use `express-rate-limit`. Return `429 RATE_LIMITED` with standard envelope.

---

## Cookie Settings

```typescript
// Development
{ httpOnly: true, sameSite: 'strict', secure: false, domain: 'localhost' }

// Production
{ httpOnly: true, sameSite: 'strict', secure: true, domain: COOKIE_DOMAIN }
```

---

## Secrets Management

- Never commit `.env` files
- Keep `.env.example` updated with placeholder values
- Rotate JWT secrets if compromised
- Demo seed passwords: document in README, never use in production

---

## Guest Cart Security

- Guest `session_id`: UUID v4, stored in localStorage
- Sent as `X-Session-Id` header on cart requests
- Session IDs are not authentication — treat as opaque identifiers
- Cart merge on login requires authenticated user
