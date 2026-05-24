import { useParams } from 'react-router-dom';

import { ErrorState } from '@/components/features/ErrorState';
import { OrderLineItems, OrderTimeline } from '@/components/features/OrderTimeline';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrder } from '@/hooks/use-orders';
import { formatPrice } from '@/lib/formatPrice';

export function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError || !order) {
    return <ErrorState message="Order not found." onRetry={() => refetch()} />;
  }

  const shippingAddress = order.shippingAddress as {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Order {order.id.slice(0, 8)}</h2>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderLineItems items={order.items} />
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{shippingAddress.line1}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
