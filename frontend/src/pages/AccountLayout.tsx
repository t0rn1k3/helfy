import { NavLink, Outlet } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { cn } from '@/lib/utils';

const accountLinks = [
  { to: '/account/profile', label: 'Profile' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/orders', label: 'Orders' },
];

export function AccountLayout() {
  return (
    <PageShell title="Account" description="Manage your profile, addresses, and orders.">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-2 md:flex-col">
          {accountLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </PageShell>
  );
}
