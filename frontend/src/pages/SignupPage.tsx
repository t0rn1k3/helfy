import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SignupPage() {
  return (
    <PageShell title="Create account" description="Join Helfy and start shopping.">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Registration form wired in Phase 6.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" disabled>
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
