import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong loading this content.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
