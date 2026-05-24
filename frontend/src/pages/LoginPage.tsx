import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <PageShell title="Sign in" description="Welcome back. Sign in to your account.">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Auth form wired in Phase 6.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" disabled>
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
