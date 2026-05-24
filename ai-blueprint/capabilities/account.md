# Account Capability

> Profile, addresses, order history, order detail with status timeline.
> Orders API: [cart-checkout.md](./cart-checkout.md)

---

## Purpose

Authenticated user self-service: manage profile, shipping addresses, and view order history.

---

## Backend Modules

- `backend/src/modules/users/` — profile + addresses
- `backend/src/modules/orders/` — history + detail (shared with checkout)

---

## Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/me` | Yes | Current user profile |
| PATCH | `/me` | Yes | Update name, email |
| PATCH | `/me/password` | Yes | Change password (requires current) |
| GET | `/me/addresses` | Yes | List addresses |
| POST | `/me/addresses` | Yes | Create address |
| PATCH | `/me/addresses/:id` | Yes | Update address |
| DELETE | `/me/addresses/:id` | Yes | Delete address |
| PATCH | `/me/addresses/:id/default` | Yes | Set default shipping address |
| GET | `/orders` | Yes | Paginated order history |
| GET | `/orders/:id` | Yes | Order detail |

---

## Shared Schemas

- `addressSchema` — line1, line2?, city, state, postalCode, country
- `updateProfileSchema` — name, email
- `changePasswordSchema` — currentPassword, newPassword

---

## Frontend Routes

```
/account              → AccountLayout (sidebar nav)
/account/profile      → ProfilePage
/account/addresses    → AddressesPage
/account/orders       → OrdersPage
/account/orders/:id   → OrderDetailPage
```

All routes wrapped in `ProtectedRoute`.

---

## Order Status Timeline

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                  ↘ CANCELLED
```

Display as vertical stepper on `OrderDetailPage` using shadcn-style steps or custom timeline component.

---

## Frontend Components

| Component | Role |
| --------- | ---- |
| `AccountLayout` | Sidebar nav between profile / addresses / orders |
| `ProfileForm` | React Hook Form + Zod for name, email, password |
| `AddressCard` | Display address with edit/delete/default actions |
| `AddressForm` | Create/edit address dialog |
| `OrderList` | Paginated table/cards with status badges |
| `OrderTimeline` | Status stepper on detail page |
| `OrderLineItems` | Product list with price snapshots |

---

## Acceptance Criteria

- [ ] All `/account/*` routes require authentication
- [ ] Address CRUD with default indicator
- [ ] Order history paginated with status badges
- [ ] Order detail: line items, shipping address, timeline
- [ ] Password change requires current password verification
