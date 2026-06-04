# Helfy eCommerce — Tech Operations Engineer Interview Preparation Guide

> **Role:** Tech Operations Engineer (NOC) — 3rd Round Technical Interview  
> **Stack:** React 19 + Vite, Node.js/Express 5, Drizzle ORM, MySQL 8, TypeScript (strict)  
> **Prepared from:** Full static analysis of this monorepo  
> **Instruction:** This document is for preparation only. No code was changed.

---

## Table of Contents

1. [Project Presentation & Code Review (Developer Role)](#1-project-presentation--code-review-developer-role)
2. [Debugging & Operations (NOC/Tech Ops Role)](#2-debugging--operations-noctech-ops-role)
3. [Algorithms & Performance Data Structures](#3-algorithms--performance-data-structures)
4. [Monitoring, Metrics & Incident Response](#4-monitoring-metrics--incident-response)
5. [Quick Reference Card](#5-quick-reference-card)

---

## 1. Project Presentation & Code Review (Developer Role)

### 1.1 Repository Architecture — The "Big Picture" Pitch

This is an **npm workspaces monorepo** with four packages:

```
frontend/   → React 19 + Vite 6 SPA (port 5173)
backend/    → Express 5 REST API (port 4000)
shared/     → Single source of truth for TypeScript types + Zod schemas
database/   → Drizzle-generated SQL migrations + seed scripts
```

**Why this structure matters for NOC:** All services live in one repo, so a single `git log` covers the entire system's change history. When an incident happens, you can immediately correlate a deployment with a code change by checking the git blame on any file.

**Key entry points for incident response:**

| Component | File | What it does |
|-----------|------|--------------|
| API server bootstrap | `backend/src/server.ts` | Starts Express on `env.PORT` |
| App composition | `backend/src/app.ts` | Registers all middleware + routes |
| Env validation | `backend/src/config/env.ts` | Fails fast at startup if any var is missing |
| DB connection | `backend/src/db/client.ts` | mysql2 pool (limit 10) + retry logic |
| Error handling | `backend/src/middleware/error.middleware.ts` | Centralised — never leaks stack traces |
| Health check | `GET /api/v1/health` | Returns `{ status: 'ok' }` |

---

### 1.2 "AI Generated This, But I Would Optimize It" — Three Specific Examples

#### Example 1: Parallel Data Fetching vs. Two Sequential Network Requests (`ProductDetailPage.tsx`)

**The AI-generated pattern (lines 31–32):**

```typescript
// frontend/src/pages/ProductDetailPage.tsx
const { data: product, isLoading, isError, refetch } = useProduct(slug);
const { data: reviewsData } = useProductReviews(slug, { page: 1, limit: 10 });
```

**What to say in the interview:**

> "The AI placed two independent `useQuery` calls in the same component. React renders top-to-bottom, so TanStack Query fires both requests in parallel — that part is actually fine. But there are two round trips: one to `GET /api/v1/products/:slug` and a second to `GET /api/v1/products/:slug/reviews`. 
>
> In production under high traffic, each is a separate DB query. The optimization I'd propose is to extend the product detail endpoint to include the first page of reviews in its response — collapsing two HTTP round trips into one. This halves the time-to-interactive for the product detail page, which is the most conversion-critical page in an eCommerce store.
>
> Alternatively, I'd use TanStack Query's `useQueries` hook with `Promise.all` on the client side to ensure they fire simultaneously if keeping them separate, and add `staleTime: 5 * 60 * 1000` to cache product data aggressively since product details rarely change."

---

#### Example 2: O(n²) Linear Scan Inside a Loop During Cart Merge (`cart/service.ts`)

**The AI-generated pattern (lines 192–209):**

```typescript
// backend/src/modules/cart/service.ts  — mergeGuestCart()
for (const guestRow of guestItems) {                          // O(n) outer loop
  const guestItem = guestRow.item;
  const existing = userItems.find(                            // O(m) linear scan
    (row) => row.item.productId === guestItem.productId
  );
  if (existing) {
    await cartRepository.updateItem(existing.item.id, ...);   // N individual DB calls
  } else {
    await cartRepository.insertItem(...);                      // M individual DB calls
  }
}
```

**Two performance problems:**

1. `Array.find()` inside a `for` loop → **O(n × m)** complexity where n = guest items, m = user items.
2. One `await cartRepository.updateItem/insertItem` per iteration → **N sequential database round trips** instead of a single batch operation.

**What to say in the interview:**

> "This merge logic has two performance issues. First, `Array.find()` inside a `for` loop is O(n×m) — for every guest cart item, it scans the entire user items array. The fix is to build a **HashMap** (a JavaScript `Map`) keyed on `productId` before the loop, giving O(1) lookups.
>
> Second, each `await` inside the loop is a sequential database round trip. In production, if a user has 10 items in their guest cart, this fires 10 separate INSERT/UPDATE statements one after another instead of one batched transaction.
>
> Here's the refactored approach:

```typescript
// Build O(1) lookup map — replaces O(m) Array.find
const userItemMap = new Map(
  userItems.map(row => [row.item.productId, row.item])
);

// Separate into updates and inserts
const updates: Array<{ id: string; quantity: number; priceSnapshot: number }> = [];
const inserts: Array<{ ... }> = [];

for (const guestRow of guestItems) {
  const existing = userItemMap.get(guestRow.item.productId); // O(1)
  if (existing) {
    updates.push({ id: existing.id, ... });
  } else {
    inserts.push({ ... });
  }
}

// Execute in a single DB transaction — 1 round trip instead of N
await db.transaction(async (tx) => {
  if (inserts.length > 0) await tx.insert(cartItems).values(inserts);
  // batch updates...
});
```

> In practice, cart sizes are small (< 20 items) so the actual impact is minimal — but identifying this pattern demonstrates that I understand algorithmic complexity and database I/O as separate concerns."

---

#### Example 3: `isAuthenticated` Flag Persisted to localStorage (`auth-store.ts`)

**The AI-generated pattern (lines 26–33):**

```typescript
// frontend/src/store/auth-store.ts
persist(
  (set) => ({ ... }),
  {
    name: 'helfy-auth',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,  // ← persisted to localStorage
    }),
  },
)
```

**What to say in the interview:**

> "The `accessToken` is correctly excluded from persistence — it's in-memory only. But `isAuthenticated: true` is persisted to localStorage. This means after a page reload, the app renders the user as 'logged in' before it has verified with the server. 
>
> In a NOC scenario this matters because: if a user's account is disabled or their refresh token is revoked server-side (e.g., password reset, security incident, admin ban), the frontend still shows them as authenticated until they make an API call that returns 401.
>
> The secure pattern is: on app startup, always call `POST /auth/refresh`. If the httpOnly cookie is valid, silently re-authenticate and populate the store. If it fails, call `clearAuth()`. This makes the httpOnly cookie the source of truth, not localStorage. The `partialize` function should only persist `user` for pre-fill display purposes, never `isAuthenticated`."

---

### 1.3 Justifying Architectural Choices

#### State Management: Zustand + TanStack Query

> "I use **two complementary state systems** by design. TanStack Query owns all **server state** — product lists, cart contents, order history. It handles caching, background refetching, stale-while-revalidate, and optimistic updates automatically. Zustand owns **client state** — the authenticated user identity, the cart item count badge (a derived UI number, not the full cart data), and modal open/close state.
>
> The reason they don't overlap: if I put the cart in Zustand, I'd have to manually manage cache invalidation when the server responds. TanStack Query does this for me. The `useRemoveCartItem` hook in `use-cart.ts` lines 119–125 demonstrates this — it does an **optimistic update** (`onMutate`), then rolls back if the server rejects it (`onError`), then syncs with the server response (`onSuccess`). That's 3 lines of logic instead of a custom reducer."

#### API Routes: Domain-Driven Modules

> "The backend is structured as a domain-driven monolith — each business domain (auth, products, cart, orders) has exactly four files: `routes.ts`, `controller.ts`, `service.ts`, `repository.ts`. This separation means a NOC engineer can find any logic in < 30 seconds. If a cart merge bug is reported, I go to `modules/cart/service.ts`. If a database query is slow, I go to `modules/*/repository.ts`. The controller layer is intentionally thin — it only extracts request data and sends the response. Zero business logic lives in controllers."

#### Security & Auth

> "The auth system implements three layers of security:
>
> 1. **argon2** for password hashing — OWASP-recommended over bcrypt because it's resistant to GPU brute-force attacks. In `auth/service.ts` line 104: `const passwordHash = await argon2.hash(input.password)`.
>
> 2. **JWT dual-token rotation** — 15-minute access tokens (in-memory) + 7-day refresh tokens (httpOnly cookie). The refresh token is never stored raw in the DB — only its SHA-256 hash is stored (`utils/hash.ts`). Even if the DB is breached, the tokens are useless without the secret.
>
> 3. **Refresh token family detection** — in `auth/service.ts` lines 56–58: if a refresh token is presented that doesn't exist in the DB (because it was already rotated), the entire token family is wiped. This automatically logs out a session hijacker AND the legitimate user, preventing silent token theft."

---

## 2. Debugging & Operations (NOC/Tech Ops Role)

### 2.1 Most Likely Production Issues — By Priority

#### Issue 1: MySQL Connection Pool Exhaustion (HIGH RISK)

**Location:** `backend/src/db/client.ts`, line 12: `connectionLimit: 10`

**Trigger scenario:** Traffic spike causes > 10 concurrent requests that each hold a DB connection for an extended time (slow query, deadlock, long transaction).

**Symptoms:**
- All API calls start timing out with HTTP 504
- Backend logs show: `Error: Too many connections` or `waitForConnections: true` queue backing up
- The health endpoint `GET /api/v1/health` itself may hang (it doesn't query the DB but the server event loop backs up)
- `GET /api/v1/health` still returns `{ status: 'ok' }` — **this is deceptive** because the health check doesn't test DB connectivity. A smart health check would run `SELECT 1`.

**Operators' action:** Check active connections with `SHOW PROCESSLIST` in MySQL. If you see many `Sleep` or long-running queries, the pool is saturated.

---

#### Issue 2: CORS Failure (HIGH VISIBILITY, Easy to Fix)

**Location:** `backend/src/app.ts`, lines 23–27; `backend/src/config/env.ts`, line 25

**Trigger scenario:** `CORS_ORIGINS` env var is wrong in the production environment (e.g., uses `http://` instead of `https://`, has a trailing slash, or the wrong domain).

**Symptoms:**
- Browser console: `Access to XMLHttpRequest at 'https://api.helfy.com/...' from origin 'https://helfy.com' has been blocked by CORS policy`
- Network tab: `OPTIONS` preflight request gets `403` or response has no `Access-Control-Allow-Origin` header
- All authenticated API calls fail; `GET /api/v1/health` works fine when called directly from the server (no CORS on same-origin server-to-server)

**Diagnostic command:**
```bash
curl -I -X OPTIONS https://api.helfy.com/api/v1/products \
  -H "Origin: https://helfy.com" \
  -H "Access-Control-Request-Method: GET"
# Should return: Access-Control-Allow-Origin: https://helfy.com
```

---

#### Issue 3: Refresh Token Cookie Not Being Sent (Medium Risk)

**Location:**
- `backend/src/modules/auth/controller.ts` — sets `httpOnly` cookie
- `frontend/src/api/client.ts`, line 11: `withCredentials: true`

**Trigger scenario:** Production uses HTTPS with a subdomain separation (API on `api.helfy.com`, frontend on `helfy.com`) but `COOKIE_DOMAIN` is set incorrectly or `COOKIE_SECURE=false` in production.

**Symptoms:**
- User logs in, gets access token, but on the next refresh (after 15 minutes) the `POST /auth/refresh` returns 401 "Refresh token missing"
- Users are logged out every 15 minutes
- In Network tab: `POST /auth/refresh` request shows no `Cookie` header being sent

**Diagnostic:** Open DevTools → Application → Cookies. Check if `refreshToken` cookie exists, its domain, and `Secure` flag.

---

#### Issue 4: Rate Limiter False Positives Behind Load Balancer (Medium Risk)

**Location:** `backend/src/middleware/rateLimit.middleware.ts`

**Trigger scenario:** A reverse proxy (nginx, AWS ALB) doesn't forward the real client IP (`X-Forwarded-For`), so `express-rate-limit` sees all traffic as coming from the load balancer's IP. One legitimate user triggering 10 auth requests in 15 minutes blocks everyone.

**Symptoms:**
- Users randomly get HTTP 429 "Too Many Requests"
- Pattern: it affects all users simultaneously, not just one
- Backend logs show rate limit hits from a single IP (the LB IP)

**Fix (for future reference):** Configure `express-rate-limit` with `trustProxy: true` and nginx with `proxy_set_header X-Real-IP $remote_addr`.

---

#### Issue 5: Unhandled Promise Rejection Crashing the Process (Low Risk in this codebase, High Severity)

**Location:** `backend/src/utils/asyncHandler.ts` — wraps all route handlers

**Why this codebase is relatively safe:** Every route handler is wrapped with `asyncHandler` which calls `.catch(next)`, forwarding errors to `error.middleware.ts`. 

**The remaining risk:** Any raw `Promise` created outside a route handler (e.g., a background job, event emitter callback, `setTimeout`) that rejects without a handler will crash the Node.js process in Node 15+.

**Check for unhandled rejections:**
```bash
# In production logs, look for:
grep "UnhandledPromiseRejection" /var/log/helfy/backend.log
```

---

### 2.2 Troubleshooting Workflow — Customer Reports a "Critical Bug"

**Scenario:** Customer support says "User alice@example.com cannot checkout. The button does nothing."

```
STEP 1 — TRIAGE (2 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Ask support: What URL exactly? What browser? Desktop or mobile?
□ Can you reproduce it yourself on a test account?
□ When did it start? (narrow the deployment window)
□ Is it affecting 1 user, all users, or some users?
□ Check: is GET /api/v1/health returning { status: 'ok' }?

STEP 2 — BROWSER DEVTOOLS (Network Tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Open DevTools → Network tab → Preserve log ON → Disable cache ON
□ Reproduce the checkout action
□ Look for failed requests (red rows):
  - POST /api/v1/orders — what status code? (422 = validation, 401 = auth, 500 = server bug)
  - GET /api/v1/cart — is the cart loading correctly?
□ Click the failed request → Headers tab:
  - Is "Authorization: Bearer <token>" present? (if not → auth store issue)
  - Is "Cookie: refreshToken=..." in the request? (only visible in DevTools if not httpOnly)
□ Click the failed request → Response tab:
  - Read the JSON error body: { success: false, error: "...", code: "..." }
  - The error code maps to ErrorCode enum in shared/src/types/api.ts

STEP 3 — BROWSER DEVTOOLS (Console Tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Look for JavaScript errors (red lines)
□ Look for "Uncaught (in promise)" errors — indicates a .catch() is missing in frontend
□ Type in console: useAuthStore.getState() — check isAuthenticated and accessToken

STEP 4 — BACKEND LOGS (pino structured JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Filter by the exact timestamp from Network tab
docker logs helfy_backend --since 2026-06-04T10:30:00 --until 2026-06-04T10:35:00

# Or if using a log aggregator, search for:
{ "level": "error" }
{ "userId": "<user's UUID>" }
{ "path": "/api/v1/orders" }

# The error.middleware.ts logs unhandled errors with this structure:
# { err: {...}, method: "POST", path: "/api/v1/orders", userId: "uuid-here" }

STEP 5 — DATABASE HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Connect to Adminer (port 8080) or via CLI:
  docker exec helfy_mysql mysqladmin -u helfy -p ping
  → "mysqld is alive" = DB up

□ Check for locks or long-running queries:
  SHOW PROCESSLIST;
  SHOW FULL PROCESSLIST;

□ Check the user's cart state:
  SELECT * FROM carts WHERE user_id = '<uuid>';
  SELECT ci.*, p.name, p.stock FROM cart_items ci 
    JOIN products p ON ci.product_id = p.id 
    WHERE ci.cart_id = '<cart_id>';

□ Check if a product ran out of stock mid-session:
  SELECT id, name, stock FROM products WHERE stock = 0;

STEP 6 — SPECIFIC CHECKOUT FAILURE DECISION TREE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HTTP 401 → Token expired or cookie missing → Check COOKIE_SECURE in env
HTTP 422 → Validation error → Check order/service.ts: insufficient stock or missing address
HTTP 400 → Bad JSON body → Check checkout form serialisation in CheckoutPage.tsx
HTTP 500 → Unhandled error → Look at backend logs for the stack trace

STEP 7 — ESCALATION CRITERIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Escalate to Dev team if:
  - Error rate > 5% sustained for > 5 minutes
  - The same error appears for ALL users (not just one)
  - Logs show a panic/crash loop (container restart count > 2)
  - Database connection pool exhausted
  - Data corruption suspected (orders.status shows wrong state)
```

---

## 3. Algorithms & Performance Data Structures

### 3.1 Data Structures Directly Relevant to This Codebase

#### Hash Map — O(1) Lookup

**Where it appears in the code:**

The `refreshQueue` array in `frontend/src/api/client.ts` (lines 42–46) is a queue of pending callbacks waiting for a token refresh. This is the **request queue pattern** — a fundamental data structure for preventing thundering-herd on token refresh:

```typescript
// frontend/src/api/client.ts
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}
```

**Why this matters:** Without this queue, if 5 API calls fire simultaneously when the access token expires, all 5 would try to call `POST /auth/refresh` simultaneously. With the queue, only the first one calls refresh; the other 4 queue up and get processed the moment the new token arrives. This is O(1) for the check (`isRefreshing`) and O(n) for draining the queue.

**Interview talking point:**
> "This is a classic producer-consumer pattern. The first 401 response becomes the 'producer' — it calls the refresh endpoint. All subsequent 401s are 'consumers' — they queue up as callbacks. When the producer resolves, it calls `processQueue(newToken)` which drains all consumers synchronously. This prevents N redundant refresh calls under any traffic pattern."

---

#### Array.map / filter / reduce — Everywhere

**Specific code instances:**

```typescript
// backend/src/modules/products/repository.ts, line 100
return {
  items: rows.map((row) => row.product),    // O(n) — maps DB rows to DTOs
  total: Number(totalRows[0]?.total ?? 0),
};

// frontend/src/hooks/use-cart.ts, lines 83–85 (optimistic update)
const items = previous.items.map((item) =>
  item.id === itemId ? { ...item, quantity } : item,  // O(n) — creates new array
);

// frontend/src/hooks/use-cart.ts, lines 123–124 (optimistic remove)
const items = previous.items.filter((item) => item.id !== itemId);  // O(n)
```

**Interview talking point:**
> "`map()` and `filter()` are O(n) — they traverse the array once. They also return **new arrays** instead of mutating the original, which is critical for React's referential equality check. When TanStack Query's `setQueryData` receives a new object reference, React re-renders. If I mutated the existing array in-place, React would see the same reference and skip the re-render — creating a bug where the UI doesn't update despite state changing."

---

#### Offset-Based Pagination

**Location:** `backend/src/utils/pagination.ts` (called in `products/repository.ts` line 75 and `orders/repository.ts` line 51)

```typescript
// backend/src/utils/pagination.ts
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
```

**Big O implications:**
- `LIMIT 20 OFFSET 0` → MySQL reads rows 1–20 → fast
- `LIMIT 20 OFFSET 980` → MySQL reads and discards rows 1–980, then returns 20 → **O(offset)** degradation
- At page 50 with 20-per-page, MySQL internally scans 1000 rows to return 20

**Interview talking point:**
> "Offset-based pagination degrades at high page numbers — page 50 is 50× slower than page 1. The production-grade fix is **cursor-based pagination** (keyset pagination) using `WHERE created_at < :lastSeen ORDER BY created_at DESC LIMIT 20`. The cursor is opaque to the client but ensures O(1) MySQL index seek regardless of how deep in the list you are. The current implementation is correct for the traffic level of this app, but I'd flag it for migration when the products table exceeds 100k rows."

---

#### FULLTEXT Index — O(log n) vs. O(n) for Search

**Location:** `backend/src/modules/products/repository.ts`, lines 24–28

```typescript
// backend/src/modules/products/repository.ts
if (filters.q) {
  conditions.push(
    sql`MATCH(${products.name}, ${products.description}) AGAINST(${filters.q} IN NATURAL LANGUAGE MODE)`,
  );
}
```

**Why this is correct and important:**
- `LIKE '%keyword%'` → O(n) full table scan — unusable at scale
- `MATCH...AGAINST` with a FULLTEXT index → MySQL uses an inverted index → O(log n) lookup
- The FULLTEXT index is created in `database/migrations/0000_dry_lizard.sql`

**Interview talking point:**
> "The AI correctly chose MySQL FULLTEXT over a LIKE query. LIKE with a leading wildcard (`%keyword`) cannot use any B-tree index because MySQL doesn't know where to start. FULLTEXT builds an **inverted index** — a hash map from token to document IDs — making keyword lookups O(log n). At 100k products, this is the difference between a 200ms query and a 20-second table scan."

---

### 3.2 O(n²) Complexity — The Cart Merge Issue (Full Analysis)

**File:** `backend/src/modules/cart/service.ts`, `mergeGuestCart()`, lines 192–209

```typescript
// Outer loop: O(n) where n = guest cart items
for (const guestRow of guestItems) {
  const guestItem = guestRow.item;
  // Inner scan: O(m) where m = user cart items ← THIS IS THE PROBLEM
  const existing = userItems.find((row) => row.item.productId === guestItem.productId);
  
  if (existing) {
    await cartRepository.updateItem(existing.item.id, { quantity, priceSnapshot });
    // ↑ Awaited inside loop = sequential DB round trips
  } else {
    await cartRepository.insertItem({ ... });
    // ↑ Same problem
  }
}
```

**Complexity breakdown:**

| Operation | Current | Optimized |
|-----------|---------|-----------|
| Finding existing item | O(n×m) — Array.find in loop | O(n+m) — build Map then O(1) lookups |
| DB writes | O(n) sequential awaits | O(1) batch insert/update in transaction |
| Total DB round trips | n (up to 20) | 1 (transaction) |

**Why it's not a production emergency today:**
- Cart items are capped at 99 (`Math.min(99, ...)`) and practically average 3–5
- `mergeGuestCart` is called once at login, not on every page load
- The real bottleneck is the N sequential DB awaits, not the find() algorithm

**How to present this in the interview:**
> "I identified two complexity issues in the cart merge. The `Array.find()` inside a `for` loop is a classic O(n²) pattern that a junior engineer writes without thinking. I'd refactor to a `Map` keyed on `productId` for O(1) lookups. The more operationally significant issue is the sequential `await` per item — 10 cart items means 10 database round trips. In a DB with 50ms average latency, merging a 10-item cart takes 500ms. A single `INSERT ... VALUES (row1), (row2), ...` would do it in 50ms. This is a 10× improvement."

---

## 4. Monitoring, Metrics & Incident Response

### 4.1 Key Metrics for Production Monitoring

#### Infrastructure Metrics (collected every 15s)

| Metric | Normal Range | Alert Threshold | Source |
|--------|-------------|-----------------|--------|
| HTTP Request Rate | Varies by time | — | nginx/express logs |
| HTTP 5xx Error Rate | < 0.1% | > 1% for 3min | pino logs |
| HTTP 4xx Rate | < 5% | > 20% for 5min | pino logs |
| API p95 Latency | < 200ms | > 1000ms | pino-http `responseTime` |
| API p99 Latency | < 500ms | > 3000ms | pino-http |
| Node.js Heap Used | < 300MB | > 500MB | Node.js `process.memoryUsage()` |
| Node.js Event Loop Lag | < 10ms | > 100ms | `perf_hooks` |
| MySQL Active Connections | < 8/10 | = 10 (pool full) | `SHOW STATUS LIKE 'Threads_connected'` |
| MySQL Slow Queries | < 5/min | > 20/min | MySQL slow query log |
| MySQL Query Time (avg) | < 50ms | > 200ms | Performance Schema |
| Container CPU | < 60% | > 85% sustained | Docker stats |
| Container Memory | < 512MB | > 900MB | Docker stats |
| Container Restarts | 0 | > 2 in 10min | Docker events |

#### Business / Application Metrics (collected every 60s)

| Metric | Why It Matters |
|--------|----------------|
| Auth failure rate (`POST /auth/login` → 401) | Security signal — brute force detection |
| Refresh token rotation rate | Indicates active sessions vs. stale sessions |
| Cart add-to-cart success rate | Any degradation = lost revenue |
| Order creation success rate | `POST /api/v1/orders` — most business-critical endpoint |
| Checkout abandonment at each step | Identifies UX/tech issues in the 4-step stepper |

#### Endpoints to Probe Every 30 Seconds (Synthetic Monitoring)

```bash
# Tier 1 — Must be 200 or page full red alert
GET  /api/v1/health

# Tier 2 — Must be 200 within 500ms
GET  /api/v1/products?limit=20
GET  /api/v1/categories

# Tier 3 — Auth flow (probe with test account)
POST /api/v1/auth/login     { email: "monitor@helfy.com", password: "..." }
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

---

### 4.2 RUNBOOK: 500 Internal Server Error in Production

```
════════════════════════════════════════════════════════════════════
RUNBOOK: HTTP 500 Internal Server Error — Helfy Backend API
Version: 1.0 | Owner: Tech Operations / NOC
Severity: P1 if > 5% of requests | P2 if isolated/intermittent
════════════════════════════════════════════════════════════════════

TRIGGER CONDITIONS
──────────────────
• Synthetic monitor: GET /api/v1/health returns non-200 (P1)
• HTTP 5xx error rate > 1% for 3+ consecutive minutes (P1)
• Any user-reported 500 with consistent repro steps (P2)

────────────────────────────────────────────────────────────────────
PHASE 1: IMMEDIATE TRIAGE (0–5 minutes)
────────────────────────────────────────────────────────────────────

ACTION 1.1 — CHECK HEALTH ENDPOINT
  curl -s https://api.helfy.com/api/v1/health | jq .
  
  Expected: { "success": true, "data": { "status": "ok" } }
  
  If TIMEOUT or connection refused:
    → The Node.js process has crashed or the container is down
    → Go to ACTION 1.4 immediately
  
  If 200 OK:
    → Server is running; issue is likely in a specific route
    → Continue to ACTION 1.2

ACTION 1.2 — IDENTIFY SCOPE
  Answer these questions:
  □ Is it ALL endpoints or ONE specific endpoint?
    Test: curl /api/v1/products && curl /api/v1/categories
  □ Is it affecting ALL users or ONE user?
    Test: reproduce with a fresh incognito session
  □ When did it start? (check pino logs for first 500 timestamp)
  □ Was there a deployment in the last 60 minutes?
    git log --oneline -5

ACTION 1.3 — READ BACKEND LOGS
  # Docker deployment
  docker logs helfy_backend --tail 200 --timestamps | grep '"level":50'
  
  # Structured log fields to extract:
  # { "level": 50, "err": { "message": "...", "stack": "..." },
  #   "method": "POST", "path": "/api/v1/orders", "userId": "..." }
  
  What the log tells you:
  ┌─────────────────────────────────────────────────────────┐
  │ "Cannot read properties of undefined"                   │
  │  → Null pointer in controller/service; likely a DB row  │
  │    that was expected but not found                       │
  │                                                          │
  │ "ER_ACCESS_DENIED_ERROR"                                │
  │  → DATABASE_URL credentials wrong or user lacks perms   │
  │                                                          │
  │ "ECONNREFUSED" or "ETIMEDOUT"                           │
  │  → MySQL is down or unreachable (Go to PHASE 2)         │
  │                                                          │
  │ "ER_LOCK_DEADLOCK"                                      │
  │  → Two transactions are deadlocked (orders creation)    │
  │  → Transient — usually self-resolves; monitor rate       │
  │                                                          │
  │ "ER_NO_SUCH_TABLE"                                      │
  │  → Migration was not applied after deployment           │
  │  → Run: npm run db:migrate                               │
  │                                                          │
  │ "jwt malformed" or "invalid signature"                  │
  │  → JWT_ACCESS_SECRET changed; all tokens invalidated    │
  │  → Users must re-login; coordinate with deployment team  │
  └─────────────────────────────────────────────────────────┘

ACTION 1.4 — CHECK CONTAINER STATUS
  docker ps -a | grep helfy
  docker stats helfy_backend --no-stream
  docker inspect helfy_backend | jq '.[0].State'
  
  If RestartCount > 2 in 10 minutes:
    → Container crash loop → check OOM kill: docker inspect | grep OOMKilled
    → If OOMKilled: true → Node.js heap overflow → escalate to Dev
    → Otherwise: check logs for the crash reason

────────────────────────────────────────────────────────────────────
PHASE 2: DATABASE HEALTH CHECK (5–10 minutes)
────────────────────────────────────────────────────────────────────

ACTION 2.1 — PING THE DATABASE
  docker exec helfy_mysql mysqladmin -u helfy -phelfy_dev_password ping
  → "mysqld is alive" = MySQL process is up
  → "connect to server at 'localhost' failed" = MySQL is down
  
  If MySQL is down:
    docker start helfy_mysql
    # Wait 30 seconds for healthcheck to pass
    docker ps | grep helfy_mysql   # Should show (healthy)

ACTION 2.2 — CHECK ACTIVE CONNECTIONS
  docker exec -it helfy_mysql mysql -u helfy -phelfy_dev_password -e \
    "SHOW STATUS LIKE 'Threads_connected'; SHOW STATUS LIKE 'Max_used_connections';"
  
  Connection pool limit in code: connectionLimit: 10 (db/client.ts:12)
  If Threads_connected = 10 AND requests are timing out:
    → Pool exhaustion confirmed
    
  ACTION: Find the blocking queries:
    SHOW FULL PROCESSLIST;
    
  Kill a specific blocking query (replace PID):
    KILL QUERY <pid>;

ACTION 2.3 — CHECK FOR SLOW QUERIES
  docker exec -it helfy_mysql mysql -u helfy -phelfy_dev_password -e \
    "SELECT * FROM information_schema.PROCESSLIST 
     WHERE TIME > 5 ORDER BY TIME DESC;"
  
  Any query running > 5 seconds is a candidate to kill and investigate.

ACTION 2.4 — VERIFY MIGRATIONS WERE APPLIED
  docker exec -it helfy_mysql mysql -u helfy -phelfy_dev_password helfy_ecommerce -e \
    "SHOW TABLES;"
  
  Expected tables: users, products, categories, carts, cart_items,
                   orders, order_items, product_images, product_reviews,
                   refresh_tokens, addresses
  
  If any table is missing → run migrations:
    cd /workspace && npm run db:migrate

────────────────────────────────────────────────────────────────────
PHASE 3: ISOLATE THE FAILING ROUTE (10–15 minutes)
────────────────────────────────────────────────────────────────────

  Test each major route with a curl probe:
  
  # Public (no auth required)
  curl -s https://api.helfy.com/api/v1/products?limit=1 | jq .success
  curl -s https://api.helfy.com/api/v1/categories | jq .success
  
  # Auth flow
  curl -s -X POST https://api.helfy.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"monitor@helfy.com","password":"password123"}' | jq .
  
  # Cart (requires session header)
  curl -s https://api.helfy.com/api/v1/cart \
    -H "X-Session-Id: test-session-123" | jq .success
  
  Decision matrix:
  ┌────────────────────────────────────────────────────────┐
  │ /products fails → DB issue with products table        │
  │ /auth/login fails → argon2 or DB users table issue    │
  │ /auth/refresh fails → refresh_tokens table or JWT key │
  │ /cart fails → cart/cart_items table or session issue  │
  │ /orders fails → transaction issue or order service    │
  │ ALL fail → server crash or DB entirely down            │
  └────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────
PHASE 4: IMMEDIATE REMEDIATION OPTIONS
────────────────────────────────────────────────────────────────────

  OPTION A: Container restart (safe first action for crash loops)
    docker restart helfy_backend
    # Wait 10s then probe: curl /api/v1/health
  
  OPTION B: Rollback to last known good deployment
    git log --oneline -10   # Find the last stable commit SHA
    git checkout <SHA>
    docker build -t helfy_backend:rollback .
    docker stop helfy_backend && docker run helfy_backend:rollback
  
  OPTION C: Scale connection pool (temporary, edit env var — NOT code)
    # Set DATABASE_POOL_LIMIT=20 in production env
    # Restart the container — takes effect without code change
    # NOTE: Verify MySQL max_connections supports this:
    # SHOW VARIABLES LIKE 'max_connections';  # Default: 151

────────────────────────────────────────────────────────────────────
ESCALATION CRITERIA — CALL DEV TEAM IF:
────────────────────────────────────────────────────────────────────
  □ 500 error rate > 5% sustained for > 10 minutes with no root cause
  □ Container OOMKilled repeatedly (heap issue requires code fix)
  □ ER_LOCK_DEADLOCK rate > 5/min (requires transaction analysis)
  □ Data corruption suspected (order totals incorrect, missing items)
  □ JWT secret rotation needed (security incident — can't do alone)
  □ FULLTEXT index corruption (requires REPAIR TABLE — DBA required)
  □ All rollback options exhausted

ESCALATION TEMPLATE (for Dev team paging):
  "P1: Helfy backend returning 500 on [ROUTE] since [TIME].
   Error in logs: [PASTE LOG LINE].
   DB status: [up/down/pool exhausted].
   Actions taken: [LIST].
   Rollback attempted: [yes/no — result]."

════════════════════════════════════════════════════════════════════
END OF RUNBOOK
════════════════════════════════════════════════════════════════════
```

---

### 4.3 Simulate the Exact Monitoring Dashboard You'd Propose

If this app were deployed to production, you'd set up the following using standard OSS tools (Prometheus + Grafana + Loki or equivalent managed services):

```
┌──────────────────────────────────────────────────────────────┐
│                    HELFY OPERATIONS DASHBOARD                │
├─────────────────────┬────────────────────┬───────────────────┤
│   SERVICE HEALTH    │   TRAFFIC (live)   │   ERROR RATES     │
│                     │                    │                    │
│ Backend API   🟢    │ req/s: 47          │ 5xx: 0.02%        │
│ MySQL         🟢    │ p50:  45ms         │ 4xx: 3.1%         │
│ Frontend CDN  🟢    │ p95: 180ms         │ Auth failures: 2  │
│                     │ p99: 420ms         │                    │
├─────────────────────┼────────────────────┼───────────────────┤
│  DB CONNECTIONS     │   NODE.JS HEALTH   │   BUSINESS KPIs   │
│                     │                    │                    │
│ Active:  6/10       │ Heap: 142MB        │ Orders/hr: 23     │
│ Slow Q:  0          │ RSS:  298MB        │ Cart adds: 187    │
│ Uptime:  99.97%     │ ELoop lag: 3ms     │ Auth success: 94% │
└─────────────────────┴────────────────────┴───────────────────┘

ALERT RULES (send PagerDuty notification):
• health endpoint non-200 for 30s → P1 IMMEDIATE
• 5xx rate > 1% for 3min → P1
• DB connections = 10 for 2min → P1
• p99 latency > 3s for 5min → P2
• Container restarts > 2/10min → P2
• Auth failure rate > 20% → P2 (security)
```

---

## 5. Quick Reference Card

(Laminate and keep during the interview)

### Key Files by Problem Type

| Problem Type | Look Here |
|-------------|-----------|
| Server won't start | `backend/src/config/env.ts` — Zod validation errors printed to stderr |
| All routes return 500 | `backend/src/middleware/error.middleware.ts` — check logs at line 47 |
| Auth not working | `backend/src/modules/auth/service.ts` + `utils/jwt.ts` |
| CORS failures | `backend/src/app.ts` lines 23–27 + `CORS_ORIGINS` env var |
| DB connection failures | `backend/src/db/client.ts` — `withRetry()` + pool config |
| Cart not saving | `backend/src/modules/cart/service.ts` — check `resolveCartContext()` |
| Orders failing | `backend/src/modules/orders/repository.ts` — `db.transaction()` |
| Frontend 401 loops | `frontend/src/api/client.ts` — refresh queue interceptor |
| User "not logged in" after reload | `frontend/src/store/auth-store.ts` — `partialize` + cookie check |
| Search returning wrong results | `backend/src/modules/products/repository.ts` — FULLTEXT query |

### ENV Vars Checklist for Production

```bash
DATABASE_URL           # mysql://user:pass@host:3306/dbname
JWT_ACCESS_SECRET      # min 32 chars (64 recommended)
JWT_REFRESH_SECRET     # min 32 chars (64 recommended), DIFFERENT from access
CORS_ORIGINS           # https://yourdomain.com (no trailing slash)
COOKIE_SECURE          # true (production HTTPS required)
COOKIE_DOMAIN          # .yourdomain.com (note leading dot for subdomains)
NODE_ENV               # production
LOG_LEVEL              # warn (not debug in production)
PORT                   # 4000
API_PREFIX             # /api/v1
```

### The "Five Whys" for the Most Common Helfy Incidents

| Symptom | Why 1 | Why 2 | Why 3 | Root Cause |
|---------|-------|-------|-------|-----------|
| Users logged out every 15min | Refresh fails → 401 | Cookie not sent | `COOKIE_SECURE=true` but HTTP in dev | Env config mismatch |
| Search returns no results | FULLTEXT query returns empty | Query string too short | MySQL FULLTEXT min word length = 3 | Search term < 3 chars |
| Checkout fails for all users | POST /orders → 500 | DB transaction fails | FK violation: product deleted mid-session | Race condition: product deactivated while in cart |
| Slow product list on page 50 | API latency 2s+ | MySQL slow query log | OFFSET 980 → scans 1000 rows | Offset-based pagination at scale |
| Cart count badge wrong | Badge shows stale number | Zustand `cartStore` not updated | `useAddToCart.onSuccess` called `setItemCount` but `useCart` query stale | TanStack Query cache not invalidated |

---

*End of Interview Preparation Guide — helfy eCommerce NOC/Tech Ops 3rd Round*
