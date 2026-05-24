import { useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <PageShell title="Product" description={`Product: ${slug ?? '…'}`}>
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
