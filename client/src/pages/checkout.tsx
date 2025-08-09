import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, workerId, note }: { amount: number; workerId: string; note: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your tip!",
      });
      setLocation('/success');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 w-full">
        <GlassCard className="rounded-2xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Complete Your Tip</h1>
            <p className="text-text-secondary">Secure payment powered by Stripe</p>
            <div className="text-3xl font-bold text-accent-start mt-4">${amount}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 glass-card rounded-xl">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
                }}
              />
            </div>

            {note && (
              <GlassCard className="p-4 rounded-xl">
                <p className="text-sm text-text-secondary mb-1">Your note:</p>
                <p className="text-text-primary">{note}</p>
              </GlassCard>
            )}

            <GradientButton
              type="submit"
              className="w-full py-4 text-lg"
              disabled={!stripe || isLoading}
            >
              {isLoading ? 'Processing...' : `Send $${amount} Tip`}
            </GradientButton>
          </form>

          <div className="text-center mt-4">
            <button 
              onClick={() => window.history.back()}
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Back to tip page
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default function Checkout() {
  const { handle } = useParams<{ handle: string }>();
  const [location] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [workerId, setWorkerId] = useState("");

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const amountParam = params.get('amount');
    const noteParam = params.get('note');

    if (!amountParam) {
      window.location.href = `/u/${handle}`;
      return;
    }

    const parsedAmount = parseFloat(amountParam);
    setAmount(parsedAmount);
    setNote(noteParam || '');

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: parsedAmount,
          workerId: handle, // Using handle as workerId for demo
          note: noteParam || '',
          customerName: '' // Could be collected in a form
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setWorkerId(handle || '');
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      }
    };

    createPaymentIntent();
  }, [handle]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} workerId={workerId} note={note} />
    </Elements>
  );
}
