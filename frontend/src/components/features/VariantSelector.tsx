import { cn } from '@/lib/utils';

const VARIANTS = [
  { id: 'size-m', label: 'Size', value: 'M' },
  { id: 'color-black', label: 'Color', value: 'Black' },
] as const;

interface VariantSelectorProps {
  className?: string;
}

export function VariantSelector({ className }: VariantSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {VARIANTS.map((variant) => (
        <div key={variant.id} className="space-y-2">
          <p className="text-sm font-medium">{variant.label}</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm">
              {variant.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
