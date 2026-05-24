import { useState } from 'react';
import { Link } from 'react-router-dom';
import { checkoutPaymentSchema, checkoutShippingSchema, type CheckoutInput } from '@helfy/shared';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { OrderWithItems } from '@helfy/shared';

import { CartSummary } from '@/components/features/CartSummary';
import { CheckoutStepper } from '@/components/features/CheckoutStepper';
import { OrderLineItems } from '@/components/features/OrderTimeline';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import { useCreateOrder } from '@/hooks/use-orders';
import { calculateOrderTotals } from '@/lib/checkout';
import { formatPrice } from '@/lib/formatPrice';

type ShippingForm = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: CheckoutInput['shippingMethod'];
};

type PaymentForm = {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  cardholderName: string;
};

export function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingForm | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentForm | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderWithItems | null>(null);

  const { data: cart } = useCart();
  const createOrder = useCreateOrder();

  const shippingFields = useForm<ShippingForm>({
    defaultValues: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      shippingMethod: 'standard',
    },
  });

  const paymentFields = useForm<PaymentForm>({
    defaultValues: {
      cardNumber: '4242424242424242',
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear() + 1,
      cvc: '123',
      cardholderName: '',
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <PageShell title="Checkout">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Your cart is empty.{' '}
            <Link to="/catalog" className="text-primary hover:underline">
              Continue shopping
            </Link>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const shippingMethod = shippingData?.shippingMethod ?? 'standard';
  const totals = calculateOrderTotals(cart.subtotal, shippingMethod);

  const submitOrder = () => {
    if (!shippingData || !paymentData) {
      return;
    }

    const payload: CheckoutInput = {
      shippingAddress: {
        line1: shippingData.line1,
        line2: shippingData.line2 || null,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        country: shippingData.country,
        isDefault: false,
      },
      shippingMethod: shippingData.shippingMethod,
      cardNumber: paymentData.cardNumber,
      expiryMonth: paymentData.expiryMonth,
      expiryYear: paymentData.expiryYear,
      cvc: paymentData.cvc,
      cardholderName: paymentData.cardholderName,
    };

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        setCompletedOrder(order);
        setStep(3);
        toast.success('Order placed successfully');
      },
    });
  };

  return (
    <PageShell title="Checkout" description="Shipping → Payment → Review → Confirmation">
      <CheckoutStepper currentStep={step} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            {step === 0 ? (
              <form
                className="space-y-4"
                onSubmit={shippingFields.handleSubmit((values) => {
                  const parsed = checkoutShippingSchema.safeParse({
                    shippingAddress: {
                      line1: values.line1,
                      line2: values.line2 || null,
                      city: values.city,
                      state: values.state,
                      postalCode: values.postalCode,
                      country: values.country,
                    },
                    shippingMethod: values.shippingMethod,
                  });

                  if (!parsed.success) {
                    toast.error('Please fix shipping form errors');
                    return;
                  }

                  setShippingData(values);
                  setStep(1);
                })}
              >
                <h3 className="text-lg font-semibold">Shipping address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="line1">Address line 1</Label>
                    <Input id="line1" {...shippingFields.register('line1', { required: true })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="line2">Address line 2</Label>
                    <Input id="line2" {...shippingFields.register('line2')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...shippingFields.register('city', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...shippingFields.register('state', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input id="postalCode" {...shippingFields.register('postalCode', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...shippingFields.register('country', { required: true })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="shippingMethod">Shipping method</Label>
                    <Select id="shippingMethod" {...shippingFields.register('shippingMethod')}>
                      <option value="standard">Standard ($5.00)</option>
                      <option value="express">Express ($15.00)</option>
                    </Select>
                  </div>
                </div>
                <Button type="submit">Continue to payment</Button>
              </form>
            ) : null}

            {step === 1 ? (
              <form
                className="space-y-4"
                onSubmit={paymentFields.handleSubmit((values) => {
                  const parsed = checkoutPaymentSchema.safeParse(values);
                  if (!parsed.success) {
                    toast.error('Please fix payment form errors');
                    return;
                  }
                  setPaymentData(values);
                  setStep(2);
                })}
              >
                <h3 className="text-lg font-semibold">Payment (mocked)</h3>
                <p className="text-sm text-muted-foreground">No real charge will be made.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cardholderName">Cardholder name</Label>
                    <Input id="cardholderName" {...paymentFields.register('cardholderName', { required: true })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cardNumber">Card number</Label>
                    <Input id="cardNumber" {...paymentFields.register('cardNumber', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Expiry month</Label>
                    <Input id="expiryMonth" type="number" {...paymentFields.register('expiryMonth', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Expiry year</Label>
                    <Input id="expiryYear" type="number" {...paymentFields.register('expiryYear', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" {...paymentFields.register('cvc', { required: true })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button type="submit">Review order</Button>
                </div>
              </form>
            ) : null}

            {step === 2 && shippingData && paymentData ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review your order</h3>
                <OrderLineItems
                  items={cart.items.map((item) => ({
                    id: item.id,
                    orderId: '',
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    priceSnapshot: item.priceSnapshot,
                    createdAt: item.createdAt,
                  }))}
                />
                <div className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-medium">Ship to</p>
                  <p>
                    {shippingData.line1}, {shippingData.city}, {shippingData.state}{' '}
                    {shippingData.postalCode}
                  </p>
                  <p className="mt-2 font-medium">Total: {formatPrice(totals.total)}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={submitOrder} disabled={createOrder.isPending}>
                    {createOrder.isPending ? 'Placing order…' : 'Place order'}
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 3 && completedOrder ? (
              <div className="space-y-4 text-center">
                <h3 className="text-2xl font-bold">Order confirmed</h3>
                <p className="text-muted-foreground">
                  Thank you! Your order{' '}
                  <span className="font-mono">{completedOrder.id.slice(0, 8)}</span> has been placed.
                </p>
                <div className="flex justify-center gap-2">
                  <Button asChild>
                    <Link to={`/account/orders/${completedOrder.id}`}>View order</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/catalog">Continue shopping</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <CartSummary
          subtotal={cart.subtotal}
          itemCount={cart.itemCount}
          shippingMethod={shippingMethod}
          showCheckoutButton={false}
        />
      </div>
    </PageShell>
  );
}
