# 05 — UI Design System

> shadcn/ui, Tailwind v4 tokens, premium UX patterns, motion, responsive rules.
> Architecture: [01-architecture.md](./01-architecture.md)

---

## Design Philosophy

**Premium dark eCommerce** — confident, spacious, fast. Not generic admin UI.

- Dark theme default
- Subtle contrast hierarchy (background → card → elevated)
- Generous whitespace, max content width ~1280px (`max-w-7xl`)
- Every screen has loading, empty, and error states

---

## shadcn/ui + Tailwind v4

- Style preset: **new-york**
- Config: `frontend/components.json`
- Theme file: `frontend/src/styles/globals.css`

### Color rules

Use CSS custom properties only:

```
bg-background       text-foreground
bg-card             text-card-foreground
bg-primary          text-primary-foreground
bg-muted            text-muted-foreground
border-border       ring-ring
```

**Never use raw palette classes:**
~~`bg-slate-900`~~ ~~`text-indigo-500`~~ ~~`bg-gray-800`~~

### Tailwind v4 setup

```css
@import 'tailwindcss';

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* … */
}
```

Define `:root` tokens with `oklch()` values. See existing `globals.css` for reference.

---

## Component Rules

| Location | What goes here |
| -------- | -------------- |
| `components/ui/` | shadcn primitives only — do not fork styling |
| `components/layout/` | Header, Footer, Container, PageShell, AppLayout |
| `components/features/` | Domain UI: ProductCard, CartLine, CheckoutStepper |

Install shadcn components via CLI when needed:
```bash
npx shadcn@latest add dialog form select checkbox sheet
```

Do not hand-roll components that shadcn already provides.

---

## Page Shell Pattern

Every data-driven page uses `PageShell`:

```tsx
<PageShell title="Catalog" description="Browse our collection">
  {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={data} />}
</PageShell>
```

---

## Required UI States

Every async section must handle all four:

| State | Component | Trigger |
| ----- | --------- | ------- |
| Loading | `*Skeleton` | `isLoading === true` |
| Empty | `EmptyState` | `data.length === 0` |
| Error | `ErrorState` + retry | `isError === true` |
| Success | Feature component | data available |

Never render a blank white box. Never spinner-only without skeleton layout.

---

## Interaction Design

- Every clickable element: visible `hover:` + `focus-visible:` states
- Buttons: use shadcn `Button` variants (`default`, `outline`, `ghost`)
- Forms: shadcn `Form` + React Hook Form + Zod resolver
- Toasts: Sonner via `AppProviders` — dark theme

---

## Motion (Framer Motion)

Define variants in `frontend/src/lib/motion.ts` — import, never inline:

```typescript
// lib/motion.ts
export const pageTransition = { initial, animate, exit };
export const fadeInUp = { ... };
export const scaleOnTap = { whileTap: { scale: 0.97 } };
export const staggerContainer = { ... };
export const staggerItem = { ... };
```

- Page transitions: `AnimatePresence` in `AppLayout` (already implemented)
- Add-to-cart: scale feedback on button tap
- List items: stagger animation on catalog grid

Keep animations subtle — 200–400ms, ease-out. No excessive bounce.

---

## Responsive Design

Mobile-first. Design at **375px**, then scale up:

| Breakpoint | Width | Notes |
| ---------- | ----- | ----- |
| default | 375px | Single column, stacked nav |
| `sm` | 640px | 2-column grids |
| `md` | 768px | Show desktop nav, hide mobile menu |
| `lg` | 1024px | 3–4 column product grids |
| `xl` | 1280px | Max container width |

Header: hamburger menu below `md`, full nav above.

---

## Typography

- Headings: `font-bold tracking-tight`
- Body: system font stack (already in globals.css)
- Muted text: `text-muted-foreground`
- Prices: `font-semibold tabular-nums`

---

## Images

- Always set `width` + `height` attributes
- Below-fold: `loading="lazy"`
- Product images: `aspect-square object-cover rounded-lg`
- Placeholder while loading: `Skeleton` with same aspect ratio

---

## Premium Checklist (verify before Phase 7)

- [ ] Dark theme with consistent token usage throughout
- [ ] Skeleton loaders on every async block
- [ ] Empty states with icon + message + CTA button
- [ ] Hover + focus-visible on all interactive elements
- [ ] Mobile layout usable at 375px
- [ ] Page transitions via Framer Motion
- [ ] No raw Tailwind palette colors anywhere
