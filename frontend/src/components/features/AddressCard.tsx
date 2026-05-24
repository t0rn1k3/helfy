import { Trash2 } from 'lucide-react';
import type { Address } from '@helfy/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AddressCardProps {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm">
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </div>
          {address.isDefault ? <Badge>Default</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {!address.isDefault && onSetDefault ? (
            <Button variant="ghost" size="sm" onClick={onSetDefault}>
              Set default
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
