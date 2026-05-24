import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReviewSchema } from '@helfy/shared';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreateReviewInput } from '@helfy/shared';

import { ErrorState } from '@/components/features/ErrorState';
import { ProductGallery } from '@/components/features/ProductGallery';
import { ProductGrid } from '@/components/features/ProductGrid';
import { ReviewList } from '@/components/features/ReviewList';
import { VariantSelector } from '@/components/features/VariantSelector';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddToCart } from '@/hooks/use-cart';
import { useProduct } from '@/hooks/use-products';
import { useCreateReview, useProductReviews } from '@/hooks/use-reviews';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/formatPrice';
import { scaleOnTap } from '@/lib/motion';

export function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const { data: reviewsData } = useProductReviews(slug, { page: 1, limit: 10 });
  const addToCart = useAddToCart();
  const createReview = useCreateReview(slug);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [quantity, setQuantity] = useState(1);

  const reviewForm = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { rating: 5, title: '', body: '' },
  });

  if (isLoading) {
    return (
      <PageShell title="Product">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (isError || !product) {
    return (
      <PageShell title="Product">
        <ErrorState message="Product not found." onRetry={() => refetch()} />
      </PageShell>
    );
  }

  const hasDiscount =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <PageShell title={product.name} description={product.brand}>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery slug={product.slug} images={product.images} productName={product.name} />

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
            <h2 className="text-3xl font-bold">{product.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
              {hasDiscount ? (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              ) : null}
            </div>
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-primary text-primary" />
                {product.averageRating.toFixed(1)} · {product.reviewCount} reviews
              </div>
            ) : null}
          </div>

          <p className="text-muted-foreground">{product.description}</p>
          <VariantSelector />

          <div className="flex items-center gap-3">
            <Label htmlFor="qty">Qty</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              max={99}
              className="w-20"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          <motion.div {...scaleOnTap}>
            <Button
              size="lg"
              disabled={addToCart.isPending || product.stock === 0}
              onClick={() => {
                addToCart.mutate(
                  { productId: product.id, quantity },
                  { onSuccess: () => toast.success('Added to cart') },
                );
              }}
            >
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
          </motion.div>
        </div>
      </div>

      <section className="mt-16 space-y-6">
        <h3 className="text-xl font-semibold">Customer reviews</h3>
        <ReviewList reviews={reviewsData?.data ?? []} />

        {isAuthenticated ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h4 className="font-medium">Write a review</h4>
              <form
                className="space-y-4"
                onSubmit={reviewForm.handleSubmit((values) => {
                  createReview.mutate(values, {
                    onSuccess: () => {
                      reviewForm.reset();
                      toast.success('Review submitted');
                    },
                  });
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input id="rating" type="number" min={1} max={5} {...reviewForm.register('rating', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...reviewForm.register('title')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Review</Label>
                  <Input id="body" {...reviewForm.register('body')} />
                </div>
                <Button type="submit" disabled={createReview.isPending}>
                  Submit review
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        )}
      </section>

      {product.relatedProducts.length > 0 ? (
        <section className="mt-16 space-y-6">
          <h3 className="text-xl font-semibold">Related products</h3>
          <ProductGrid products={product.relatedProducts} />
        </section>
      ) : null}
    </PageShell>
  );
}
