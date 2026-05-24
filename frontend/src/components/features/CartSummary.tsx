import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { calculateOrderTotals, type SHIPPING_RATES } from '@/lib/checkout';
import { formatPrice } from '@/lib/formatPrice';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  shippingMethod?: keyof typeof SHIPPING_RATES;
  showCheckoutButton?: boolean;
}

export function CartSummary({
  subtotal,
  itemCount,
  shippingMethod = 'standard',
  showCheckoutButton = true,
}: CartSummaryProps) {
  const totals = calculateOrderTotals(subtotal, shippingMethod);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items ({itemCount})</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(totals.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated tax</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
        {showCheckoutButton ? (
          <Button className="w-full" asChild disabled={itemCount === 0}>
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
