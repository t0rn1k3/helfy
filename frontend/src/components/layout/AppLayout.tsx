import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
