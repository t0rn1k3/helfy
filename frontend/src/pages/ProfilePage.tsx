import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, updateProfileSchema } from '@helfy/shared';
import { useForm } from 'react-hook-form';
import type { ChangePasswordInput, UpdateProfileInput } from '@helfy/shared';

import { ErrorState } from '@/components/features/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from '@/hooks/use-account';

export function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: profile ? { name: profile.name, email: profile.email } : undefined,
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !profile) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...profileForm.register('email')} />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit((values) => {
              changePassword.mutate(values, { onSuccess: () => passwordForm.reset() });
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input id="confirmNewPassword" type="password" {...passwordForm.register('confirmNewPassword')} />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
