import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { ProductGrid, ProductGridSkeleton } from '@/components/features/ProductGrid';
import { ErrorState } from '@/components/features/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/Container';
import { useProducts } from '@/hooks/use-products';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts({ page: 1, limit: 4, sort: 'popular' });
  const featured = data?.data ?? [];

  return (
    <>
      <section className="border-b border-border/60 bg-card/30">
        <Container className="py-16 md:py-24">
          <motion.div className="mx-auto max-w-3xl space-y-6 text-center" {...fadeInUp}>
            <Badge variant="secondary" className="mx-auto w-fit">
              <Sparkles className="size-3" />
              Premium eCommerce
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Discover products crafted for modern living
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse curated collections, enjoy a seamless checkout, and manage your orders in one
              place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Shop now
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Create account</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured products</h2>
            <p className="text-muted-foreground">Popular picks from our catalog</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/catalog">View all</Link>
          </Button>
        </div>

        {isLoading ? <ProductGridSkeleton count={4} /> : null}
        {isError ? <ErrorState onRetry={() => refetch()} /> : null}
        {!isLoading && !isError ? <ProductGrid products={featured} /> : null}
      </Container>

      <Container className="pb-16">
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              title: 'Curated catalog',
              description: 'Search, filter, and explore products with a premium browsing experience.',
            },
            {
              title: 'Persistent cart',
              description: 'Your cart follows you — guest or signed in — with merge on login.',
            },
            {
              title: 'Secure checkout',
              description: 'Multi-step checkout with shipping, payment, review, and confirmation.',
            },
          ].map((feature) => (
            <motion.div key={feature.title} variants={staggerItem}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/catalog">Explore</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </>
  );
}
