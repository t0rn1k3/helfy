import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/Container';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/catalog', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
];

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const itemCount = useCartStore((s) => s.itemCount);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
              {import.meta.env.VITE_APP_NAME ?? 'Helfy'}
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart" aria-label="Cart">
                <ShoppingBag />
                {itemCount > 0 ? (
                  <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
                    {itemCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/account">
                  <User className="size-4" />
                  Account
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileNav}
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
