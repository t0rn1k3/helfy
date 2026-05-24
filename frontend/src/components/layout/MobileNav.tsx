import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
];

export function MobileNav() {
  const isOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.nav
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-border bg-card p-6 shadow-xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn('rounded-md px-3 py-2 text-sm font-medium hover:bg-accent')}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Account
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}
