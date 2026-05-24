# Cart & Checkout Capability

> Persistent cart (guest + user), merge on login, 4-step checkout, order creation.
> Auth integration: [auth.md](./auth.md)

---

## Cart

### Purpose

Persistent shopping cart with guest session support and merge-on-login.

### Backend Module

`backend/src/modules/cart/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/cart` | Optional | Get cart |
| POST | `/cart/items` | Optional | Add `{ productId, quantity }` |
| PATCH | `/cart/items/:itemId` | Optional | Update quantity |
| DELETE | `/cart/items/:itemId` | Optional | Remove item |
| POST | `/cart/merge` | Yes | Merge guest cart into user cart |

### Guest vs Authenticated

| User | Cart key | Client storage |
| ---- | -------- | -------------- |
| Guest | `session_id` (UUID v4) | localStorage + `X-Session-Id` header |
| Authenticated | `user_id` | DB `carts` table |

Generate `session_id` on first cart action if not present.

### Merge Algorithm (`POST /cart/merge`)

```
For each guest cart item:
  If user cart has same product_id:
    quantity = user.qty + guest.qty
    price_snapshot = min(user.price_snapshot, guest.price_snapshot)
  Else:
    copy guest item to user cart
Delete guest cart
Return merged cart
```

### Frontend Integration

- `cartStore` — optimistic qty updates
- `useCart` — TanStack Query keyed by auth + session
- Header cart badge from query data
- On login: merge → invalidate cart query

### Cart Acceptance Criteria

- [ ] Guest cart survives page refresh
- [ ] Merge dedupes and sums quantities
- [ ] Optimistic update rolls back on error
- [ ] Cart badge updates instantly

---

## Checkout

### Purpose

Multi-step purchase: Shipping → Payment (mocked) → Review → Confirmation.

### Backend Module

`backend/src/modules/orders/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/orders` | Yes | Create order from cart |
| GET | `/orders` | Yes | Paginated order history |
| GET | `/orders/:id` | Yes | Order detail + timeline |

### Checkout Steps

| Step | Name | Data |
| ---- | ---- | ---- |
| 1 | Shipping | Saved address or new inline address |
| 2 | Payment | Card fields (mocked — no real charge) |
| 3 | Review | Order summary, confirm button |
| 4 | Confirmation | Order ID, estimated delivery |

### Order Creation Flow

```
1. Validate cart not empty
2. Snapshot prices into order_items (never live price)
3. MockPaymentService.charge(total)
4. Create order + order_items in DB transaction
5. Clear user cart
6. Return order (status: CONFIRMED)
```

### Payment Service (Mocked)

```typescript
interface PaymentService {
  charge(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}
// MockPaymentService — always succeeds, logs to pino
// Production: swap for StripePaymentService
```

### Shared Schemas

- `checkoutShippingSchema` — addressId OR inline address
- `checkoutPaymentSchema` — cardNumber, expiry, cvc (format validation only)

### Frontend Components

- `CheckoutStepper` — progress indicator, gate each step
- `ShippingStep`, `PaymentStep`, `ReviewStep`, `ConfirmationStep`
- Cannot advance if current step invalid

### Checkout Acceptance Criteria

- [ ] Price snapshot stored at purchase time
- [ ] Cart cleared after successful order
- [ ] Payment UI present, no real charge
- [ ] Confirmation shows order ID + link to detail
