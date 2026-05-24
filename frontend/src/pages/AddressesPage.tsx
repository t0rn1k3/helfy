import { useState } from 'react';
import { addressSchema } from '@helfy/shared';
import { useForm } from 'react-hook-form';
import type { Address, AddressInput } from '@helfy/shared';

import { AddressCard } from '@/components/features/AddressCard';
import { EmptyState } from '@/components/features/EmptyState';
import { ErrorState } from '@/components/features/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '@/hooks/use-account';

export function AddressesPage() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const [editing, setEditing] = useState<Address | null>(null);

  const form = useForm<AddressInput>({
    defaultValues: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefault: false,
    },
  });

  const startEdit = (address: Address) => {
    setEditing(address);
    form.reset({
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  };

  const resetForm = () => {
    setEditing(null);
    form.reset({
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefault: false,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit address' : 'Add address'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              const parsed = addressSchema.safeParse(values);
              if (!parsed.success) {
                return;
              }

              const input = parsed.data;

              if (editing) {
                updateAddress.mutate(
                  { id: editing.id, input },
                  { onSuccess: () => resetForm() },
                );
              } else {
                createAddress.mutate(input, { onSuccess: () => resetForm() });
              }
            })}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" {...form.register('line1')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" {...form.register('line2')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...form.register('state')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" {...form.register('postalCode')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...form.register('country')} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input id="isDefault" type="checkbox" {...form.register('isDefault')} />
              <Label htmlFor="isDefault">Set as default</Label>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={createAddress.isPending || updateAddress.isPending}>
                {editing ? 'Update address' : 'Add address'}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {!addresses?.length ? (
        <EmptyState title="No saved addresses" description="Add a shipping address above." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => startEdit(address)}
              onDelete={() => deleteAddress.mutate(address.id)}
              onSetDefault={() => setDefaultAddress.mutate(address.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
