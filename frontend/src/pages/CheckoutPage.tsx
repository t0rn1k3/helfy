import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent } from '@/components/ui/card';

export function CheckoutPage() {
  return (
    <PageShell
      title="Checkout"
      description="4-step checkout: Shipping → Payment → Review → Confirmation."
    >
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Checkout stepper coming in Phase 6.
        </CardContent>
      </Card>
    </PageShell>
  );
}
