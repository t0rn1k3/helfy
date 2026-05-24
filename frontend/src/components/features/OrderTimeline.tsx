import type { OrderItem, OrderStatus } from '@helfy/shared';

import { formatPrice } from '@/lib/formatPrice';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <ol className="space-y-4">
      {STATUS_FLOW.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </span>
            <div>
              <p className={`font-medium capitalize ${isCurrent ? 'text-primary' : ''}`}>{step}</p>
              {isCurrent ? (
                <p className="text-xs text-muted-foreground">Current status</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface OrderLineItemsProps {
  items: OrderItem[];
}

export function OrderLineItems({ items }: OrderLineItemsProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
          <div>
            <p className="font-medium">{item.productName}</p>
            <p className="text-muted-foreground">Qty {item.quantity}</p>
          </div>
          <p className="font-medium">{formatPrice(item.priceSnapshot * item.quantity)}</p>
        </div>
      ))}
    </div>
  );
}
