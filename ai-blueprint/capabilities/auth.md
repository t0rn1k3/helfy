# Auth Capability

> JWT access + refresh token rotation, registration, login, logout.
> Security rules: [../guidelines/04-security.md](../guidelines/04-security.md)

---

## Purpose

Secure user identity. Access token in memory, refresh token in httpOnly cookie with DB-backed rotation.

---

## Backend Module

`backend/src/modules/auth/`

```
auth/
  routes.ts, controller.ts, service.ts, repository.ts, validators.ts, types.ts
```

---

## Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Issue tokens |
| POST | `/auth/refresh` | Cookie | Rotate refresh, issue new access |
| POST | `/auth/logout` | Yes | Invalidate current refresh token |
| POST | `/auth/logout-all` | Yes | Invalidate all user refresh tokens |

---

## Token Flow

```
Register/Login
  → accessToken (JSON body, 15m) → authStore (memory)
  → refreshToken (httpOnly cookie, 7d) → hashed in refresh_tokens table

API Request
  → Authorization: Bearer {accessToken}

401 Response
  → Axios interceptor → POST /auth/refresh
  → Success: retry with new accessToken
  → Failure: clearAuth(), redirect /login
```

---

## Shared Schemas (`@helfy/shared`)

- `signupSchema` — email, password (min 8), name
- `loginSchema` — email, password

---

## Frontend Integration

| Piece | Location | Role |
| ----- | -------- | ---- |
| `authStore` | `store/auth-store.ts` | user, accessToken, isAuthenticated |
| `useAuth` | `hooks/use-auth.ts` | login, register, logout mutations |
| `ProtectedRoute` | `routes/ProtectedRoute.tsx` | redirect to `/login?redirect=…` |
| `auth.api.ts` | `api/auth.api.ts` | register, login, logout, refresh |

On login success: call `POST /cart/merge` then invalidate cart query.

---

## Acceptance Criteria

- [ ] Refresh token rotated on every `/auth/refresh`
- [ ] Old refresh token rejected after rotation
- [ ] Password never in any API response
- [ ] Auth routes rate-limited (10 / 15 min)
- [ ] Token family invalidation handles parallel tabs (AI-Gap)
