import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItemWithProduct } from '@helfy/shared';

import { Button } from '@/components/ui/button';
import { formatPrice, getProductImageUrl } from '@/lib/formatPrice';

interface CartLineProps {
  item: CartItemWithProduct;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

export function CartLine({ item, onUpdateQuantity, onRemove, isUpdating }: CartLineProps) {
  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <img
        src={getProductImageUrl(item.product.slug, 160, 160)}
        alt={item.product.name}
        className="size-20 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <p className="font-medium">{item.product.name}</p>
          <p className="text-sm text-muted-foreground">{item.product.brand}</p>
          <p className="text-sm font-semibold">{formatPrice(item.priceSnapshot)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isUpdating || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.quantity - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={isUpdating || item.quantity >= 99}
              onClick={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" disabled={isUpdating} onClick={onRemove}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
