import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <PageShell title="Page not found" description="The page you're looking for doesn't exist.">
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </PageShell>
  );
}
