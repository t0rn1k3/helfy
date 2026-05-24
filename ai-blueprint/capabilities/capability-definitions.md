# Capability Definitions

> Domain building blocks the AI composes when generating the Helfy eCommerce platform.
> Each file defines: **purpose**, **endpoints**, **integration patterns**, **acceptance criteria**.
> Engineering rules: [../guidelines/engineering-guidelines.md](../guidelines/engineering-guidelines.md)

---

## Capability Map

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Auth      │────▶│   Account    │────▶│  Addresses  │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cart      │◀───▶│  Catalog     │────▶│  Checkout   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Data Access │ API Contracts │
              │  UI Composition           │
              └───────────────────────────┘
```

---

## Capability Index

| File | Domain | Backend module(s) |
| ---- | ------ | ------------------- |
| [auth.md](./auth.md) | Registration, login, JWT refresh rotation | `modules/auth/` |
| [product-catalog.md](./product-catalog.md) | Search, filter, PDP, reviews | `products/`, `categories/`, `reviews/` |
| [cart-checkout.md](./cart-checkout.md) | Cart, guest merge, 4-step checkout, orders | `cart/`, `orders/` |
| [account.md](./account.md) | Profile, addresses, order history | `users/`, `orders/` |
| [data-access.md](./data-access.md) | Drizzle schema, migrations, repositories | `db/` |
| [ui-composition.md](./ui-composition.md) | Layout, states, shadcn, motion | `frontend/src/components/` |
| [api-contracts.md](./api-contracts.md) | Envelope, Axios, API modules, Query hooks | `frontend/src/api/` |

---

## Integration Checklist (End-to-End)

Verify before Phase 7 submission:

```
[ ] Guest browses catalog, adds items, cart persists on refresh
[ ] Guest registers/logs in → cart merges correctly
[ ] Authenticated user completes 4-step checkout
[ ] Order appears in /account/orders with correct items and prices
[ ] User updates profile and manages addresses
[ ] User logs out → protected routes redirect
[ ] Token refresh works silently during long session
[ ] Search + filters work and survive page refresh
[ ] Mobile layout usable at 375px width
[ ] All API errors show toast, no white screen crashes
```

---

## Optional: Admin (Stretch Goal)

Build only after Integration Checklist passes.

- `GET/POST/PATCH/DELETE /admin/products`
- Protected by `role: 'admin'` in auth middleware
- Simple table UI at `/admin/products`

Not required for assignment submission.
