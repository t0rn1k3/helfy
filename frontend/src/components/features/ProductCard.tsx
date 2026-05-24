import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product } from '@helfy/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, getProductImageUrl } from '@/lib/formatPrice';
import { scaleOnTap } from '@/lib/motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <motion.div {...scaleOnTap}>
      <Link to={`/products/${product.slug}`} className="group block h-full">
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={getProductImageUrl(product.slug)}
              alt={product.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {hasDiscount ? (
              <Badge className="absolute left-3 top-3" variant="secondary">
                Sale
              </Badge>
            ) : null}
          </div>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
            <h3 className="line-clamp-2 font-medium leading-snug">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatPrice(product.price)}</span>
              {hasDiscount ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              ) : null}
            </div>
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" />
                <span>{product.averageRating.toFixed(1)}</span>
                <span>({product.reviewCount})</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
