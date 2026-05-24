# 03 — Error Handling

> Backend middleware, frontend boundaries, API envelope, known error codes.
> Coding standards: [02-coding-standards.md](./02-coding-standards.md)

---

## Backend

### AppError class

```typescript
// backend/src/utils/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### asyncHandler

Wrap every async controller — no try/catch boilerplate in controllers:

```typescript
// backend/src/utils/asyncHandler.ts
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

### Error middleware

```typescript
// backend/src/middleware/error.middleware.ts
// - AppError → res.status(statusCode).json({ success: false, error, code, details })
// - ZodError → 400 VALIDATION_ERROR with field details
// - Unknown → 500 INTERNAL_ERROR (no stack trace in production)
// - Log full error with pino at error level
```

### Throwing errors in services

```typescript
throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
throw new AppError(422, 'CART_EMPTY', 'Cannot checkout with empty cart');
```

---

## Standard Error Codes

| Code | HTTP | When |
| ---- | ---- | ---- |
| `VALIDATION_ERROR` | 400 | Zod parse failed |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource missing |
| `CONFLICT` | 409 | Duplicate email, stale cart |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected failure |

---

## Frontend

### Error boundaries

- Wrap each page route in a React Error Boundary.
- Fallback UI: message + "Try again" button — never a blank screen.

### API errors

- All API failures → Sonner toast with user-friendly message.
- 401 after failed refresh → clear authStore, redirect to `/login`.
- Network error → toast with retry action.

### Form errors

- React Hook Form + Zod resolver → inline field messages.
- Server validation `details` → map to form fields when possible.

### TanStack Query

```typescript
// Default error handling in hooks
useQuery({
  queryKey: ['products'],
  queryFn: productsApi.list,
  meta: { errorMessage: 'Failed to load products' },
});
```

Global `QueryCache` onError → toast for unhandled query errors.

---

## Validation Flow

```
Request → validate.middleware (Zod) → controller → service
                ↓ fail
         400 VALIDATION_ERROR + field details
```

Shared Zod schemas from `@helfy/shared` — same rules on FE forms and BE routes.

---

## Logging (Backend)

```typescript
logger.error({ err, reqId: req.id, userId: req.user?.id }, 'Unhandled error');
```

- Never log passwords, tokens, or full credit card numbers.
- Production: log stack traces server-side only.
