import { Link } from 'react-router-dom';

import { Container } from '@/components/layout/Container';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/50">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{import.meta.env.VITE_APP_NAME ?? 'Helfy'}</p>
            <p className="text-sm text-muted-foreground">
              Premium eCommerce experience built with React, Express, and MySQL.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Shop</p>
            <Link to="/catalog" className="block text-sm text-muted-foreground hover:text-foreground">
              All products
            </Link>
            <Link to="/cart" className="block text-sm text-muted-foreground hover:text-foreground">
              Cart
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Account</p>
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to="/account/orders" className="block text-sm text-muted-foreground hover:text-foreground">
              Order history
            </Link>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Helfy. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
