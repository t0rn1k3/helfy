import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, description, children, className }: PageShellProps) {
  return (
    <Container className={cn('py-8 md:py-12', className)}>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </Container>
  );
}
