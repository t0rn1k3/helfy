import { motion } from 'framer-motion';
import type { Product } from '@helfy/shared';

import { ProductCard } from '@/components/features/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/motion';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={staggerItem}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
