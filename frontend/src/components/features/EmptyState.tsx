import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

interface EmptyStateLinkProps {
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}

export function EmptyStateLink({ title, description, href, linkLabel }: EmptyStateLinkProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button asChild>
          <a href={href}>{linkLabel}</a>
        </Button>
      }
    />
  );
}
