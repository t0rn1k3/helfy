import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent } from '@/components/ui/card';

export function CartPage() {
  return (
    <PageShell title="Your cart" description="Review items before checkout.">
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Your cart is empty. Start shopping to add items.
        </CardContent>
      </Card>
    </PageShell>
  );
}
