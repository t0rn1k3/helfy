import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageErrorBoundary } from '@/components/layout/PageErrorBoundary';
import { pageTransition } from '@/lib/motion';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MobileNav />
      <main className="flex-1">
        {/*
         * AnimatePresence is intentionally omitted here.
         *
         * React Router v7 updates the route context synchronously on navigation.
         * When AnimatePresence mode="wait" keeps the exiting motion.div alive for its
         * exit animation, the <Outlet /> inside has already updated to the NEW page —
         * because the router context changed in the same render cycle. This causes the
         * new page to fade OUT (exit on the stale div) then fade back IN (enter on the
         * new div): the "page renders twice" visual the user observes.
         *
         * Without AnimatePresence (and the exit prop), the old div unmounts immediately
         * on navigation; the new div mounts fresh with initial → animate, producing a
         * clean enter transition with zero double-render artifact in both dev and prod.
         */}
        <motion.div
          key={location.pathname}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
