import { useParams } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Card>
      <CardContent className="p-6 text-muted-foreground">
        Order detail for #{id} coming in Phase 6.
      </CardContent>
    </Card>
  );
}
