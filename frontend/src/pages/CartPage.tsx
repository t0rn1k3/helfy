import { Link } from 'react-router-dom';

import { CartLine } from '@/components/features/CartLine';
import { CartSummary } from '@/components/features/CartSummary';
import { EmptyState } from '@/components/features/EmptyState';
import { ErrorState } from '@/components/features/ErrorState';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/use-cart';

export function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (isLoading) {
    return (
      <PageShell title="Your cart">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
          <Skeleton className="h-64 w-full" />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Your cart">
        <ErrorState onRetry={() => refetch()} />
      </PageShell>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <PageShell title="Your cart" description="Review items before checkout.">
        <EmptyState
          title="Your cart is empty"
          description="Start shopping to add items."
          action={
            <Button asChild>
              <Link to="/catalog">Browse catalog</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Your cart" description="Review items before checkout.">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            {cart.items.map((item) => (
              <CartLine
                key={item.id}
                item={item}
                isUpdating={updateItem.isPending || removeItem.isPending}
                onUpdateQuantity={(quantity) => updateItem.mutate({ itemId: item.id, quantity })}
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))}
          </CardContent>
        </Card>
        <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
      </div>
    </PageShell>
  );
}
