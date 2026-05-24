# UI Composition Capability

> Reusable frontend patterns for premium, consistent UX.
> Design system: [../guidelines/05-ui-design-system.md](../guidelines/05-ui-design-system.md)

---

## Purpose

Composable UI building blocks so every page looks and behaves consistently.

---

## Layout (already scaffolded in Phase 0b)

| Component | File | Role |
| --------- | ---- | ---- |
| `AppLayout` | `layout/AppLayout.tsx` | Header + Outlet + Footer + page transitions |
| `Header` | `layout/Header.tsx` | Nav, cart badge, auth buttons |
| `Footer` | `layout/Footer.tsx` | Links, copyright |
| `Container` | `layout/Container.tsx` | `max-w-7xl mx-auto px-4` |
| `PageShell` | `layout/PageShell.tsx` | Title, description, children |

Still to build: `MobileNav` (shadcn Sheet for mobile menu).

---

## Page Shell Pattern

```tsx
<PageShell title="Catalog" description="Browse our collection">
  {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={data} />}
</PageShell>
```

---

## Required UI States

Every data-driven section handles all four:

| State | Component | Trigger |
| ----- | --------- | ------- |
| Loading | `*Skeleton` | `isLoading` |
| Empty | `EmptyState` | `data.length === 0` |
| Error | `ErrorState` | `isError` + retry |
| Success | Feature component | data available |

---

## Feature Components (to build in Phase 6)

| Component | Used on |
| --------- | ------- |
| `ProductCard` | Catalog, Home, Related |
| `ProductGrid` + `ProductGridSkeleton` | Catalog |
| `ProductGallery` | Product detail |
| `VariantSelector` | Product detail |
| `CartLine` | Cart page |
| `CartSummary` | Cart, Checkout review |
| `CheckoutStepper` | Checkout |
| `OrderTimeline` | Order detail |
| `EmptyState` | Cart, Catalog, Orders |
| `ErrorState` | All async pages |

---

## shadcn Components

**Installed:** button, card, badge, skeleton, separator

**Install when needed:**
```bash
npx shadcn@latest add input label form dialog dropdown-menu tabs select checkbox sheet avatar
```

Only use shadcn primitives from `components/ui/` — never duplicate.

---

## Motion (`lib/motion.ts`)

Already defined: `pageTransition`, `fadeInUp`, `scaleOnTap`, `staggerContainer`, `staggerItem`

- Page transitions: `AnimatePresence` in `AppLayout` ✅
- Add-to-cart: `scaleOnTap` on button
- Catalog grid: `staggerContainer` + `staggerItem`

---

## Toast Notifications

Sonner configured in `AppProviders.tsx` — use for:
- API errors (global QueryCache onError)
- Add to cart success
- Profile/address save success

---

## Acceptance Criteria

- [ ] Every async page has skeleton, empty, error states
- [ ] No raw HTML form controls — shadcn Form components only
- [ ] Mobile nav works below `md` breakpoint
- [ ] Motion variants imported from `lib/motion.ts`, not inline
