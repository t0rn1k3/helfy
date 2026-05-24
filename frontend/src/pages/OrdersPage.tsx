import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/features/EmptyState';
import { ErrorState } from '@/components/features/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/use-orders';
import { formatPrice } from '@/lib/formatPrice';

export function OrdersPage() {
  const { data, isLoading, isError, refetch } = useOrders({ page: 1, limit: 20 });
  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={
          <Button asChild>
            <Link to="/catalog">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">Order {order.id.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()} · {formatPrice(order.total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize">
                {order.status}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/account/orders/${order.id}`}>View details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
