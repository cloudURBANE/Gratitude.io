import { useState } from "react";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { openPaymentApp, isMobileDevice } from "@/lib/deep-links";

interface PaymentModalProps {
  worker: {
    id: string;
    name: string;
    venmoHandle?: string;
    cashappHandle?: string;
    zelleHandle?: string;
  };
  amount: number;
  paymentMethod: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ 
  worker, 
  amount, 
  paymentMethod, 
  onClose, 
  onSuccess 
}: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createTipMutation = useMutation({
    mutationFn: async (tipData: any) => {
      return await apiRequest("POST", "/api/tips", tipData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({
        title: "Tip sent successfully!",
        description: "Your tip has been processed.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process tip. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);

    // Get the appropriate handle
    const handle = paymentMethod === 'venmo' ? worker.venmoHandle 
                 : paymentMethod === 'cashapp' ? worker.cashappHandle
                 : worker.zelleHandle;

    if (!handle) {
      toast({
        title: "Payment method not available",
        description: `${getPaymentMethodName()} handle not set up for this worker.`,
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // Check if on mobile for better app opening experience
    if (isMobileDevice()) {
      // Use enhanced deep linking system
      await openPaymentApp(
        paymentMethod as 'venmo' | 'cashapp' | 'zelle',
        handle,
        amount,
        `Tip for ${worker.name}`,
        (status) => {
          toast({
            title: "Opening payment app...",
            description: status,
          });
        }
      );
    } else {
      // Desktop fallback - open web versions
      let webUrl = '';
      if (paymentMethod === 'venmo') {
        webUrl = `https://venmo.com/${handle.replace('@', '')}`;
      } else if (paymentMethod === 'cashapp') {
        webUrl = `https://cash.app/$${handle.replace('$', '')}`;
      } else if (paymentMethod === 'zelle') {
        toast({
          title: "Zelle Payment",
          description: `Please send $${amount} to ${handle} using your bank's mobile app or website.`,
        });
      }
      
      if (webUrl) {
        window.open(webUrl, '_blank');
      }
    }

    // Record the tip in our system
    createTipMutation.mutate({
      workerId: worker.id,
      amount: amount.toString(),
      paymentMethod,
      note: `Tip for ${worker.name}`,
    });
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'venmo': return 'Venmo';
      case 'cashapp': return 'Cash App';
      case 'zelle': return 'Zelle';
      default: return paymentMethod;
    }
  };

  const getHandle = () => {
    switch (paymentMethod) {
      case 'venmo': return worker.venmoHandle;
      case 'cashapp': return worker.cashappHandle;
      case 'zelle': return worker.zelleHandle;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Send ${amount} via {getPaymentMethodName()}
          </h3>
          <p className="text-text-secondary">
            Tip for {worker.name}
          </p>
        </div>

        <div className="bg-glass rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-text-secondary text-sm mb-1">Send to:</div>
            <div className="text-text-primary font-semibold text-lg">
              {getHandle() || 'Handle not set'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <GradientButton 
            className="w-full py-3"
            onClick={handlePayment}
            disabled={isProcessing || createTipMutation.isPending}
          >
            {isProcessing || createTipMutation.isPending 
              ? "Opening app..." 
              : `Open ${getPaymentMethodName()} App`
            }
          </GradientButton>
          
          {paymentMethod === 'zelle' && (
            <div className="text-center text-sm text-text-secondary bg-glass rounded-lg p-3">
              <p>💡 If the app doesn't open automatically, manually open your banking app and send to: <span className="text-text-primary font-medium">{getHandle()}</span></p>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-xs text-text-secondary">
              {paymentMethod === 'venmo' && "Will try to open Venmo app, then web as backup"}
              {paymentMethod === 'cashapp' && "Will try to open Cash App, then web as backup"}  
              {paymentMethod === 'zelle' && "Will try banking apps: Chase, Bank of America, Wells Fargo"}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </GlassCard>
    </div>
  );
}