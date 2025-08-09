import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GlassCard from '@/components/glass-card';
import GradientButton from '@/components/gradient-button';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, workerId, note }: { amount: number; workerId: string; note: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Record the successful tip
        await apiRequest("POST", "/api/tips", {
          workerId,
          amount: amount.toString(),
          paymentMethod: 'stripe',
          note,
          paymentIntentId: paymentIntent.id,
        });

        toast({
          title: "Payment Successful!",
          description: "Your tip has been sent successfully.",
        });
        
        setLocation('/success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <GlassCard className="w-full max-w-md p-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Complete Your Tip</h1>
          <div className="text-3xl font-bold text-accent-start mb-1">${amount.toFixed(2)}</div>
          {note && <p className="text-text-secondary text-sm">{note}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <GradientButton 
            type="submit" 
            className="w-full py-3"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Send $${amount.toFixed(2)} Tip`}
          </GradientButton>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            Back
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default function Checkout() {
  const [match, params] = useRoute('/u/:handle/checkout');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const amount = parseFloat(urlParams.get('amount') || '0');
  const note = urlParams.get('note') || '';
  const workerId = params?.handle || 'demo';

  useEffect(() => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select a tip amount first.",
        variant: "destructive",
      });
      return;
    }

    // Create payment intent
    apiRequest("POST", "/api/create-payment-intent", {
      amount,
      workerId,
      note,
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.message || 'Failed to create payment intent');
      }
    })
    .catch((error) => {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Setup Failed",
        description: "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [amount, workerId, note, toast]);

  if (!match) {
    return <div>Not found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Payment Setup Failed</h1>
          <p className="text-text-secondary mb-6">Unable to setup payment. Please try again.</p>
          <GradientButton onClick={() => window.history.back()}>
            Go Back
          </GradientButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} workerId={workerId} note={note} />
    </Elements>
  );
}