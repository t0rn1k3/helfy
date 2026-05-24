import { cn } from '@/lib/utils';

const STEPS = ['Shipping', 'Payment', 'Review', 'Confirmation'] as const;

interface CheckoutStepperProps {
  currentStep: number;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {STEPS.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li
            key={label}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
              isActive && 'border-primary bg-primary/10 text-primary',
              isComplete && 'border-primary/40 text-primary',
              !isActive && !isComplete && 'border-border text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                isActive || isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted',
              )}
            >
              {index + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export { STEPS as CHECKOUT_STEPS };
