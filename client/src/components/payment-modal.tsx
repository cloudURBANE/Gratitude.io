import { useState } from "react";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

    if (paymentMethod === 'venmo' && worker.venmoHandle) {
      // Open Venmo app with pre-filled amount
      const venmoUrl = `venmo://paycharge?txn=pay&recipients=${worker.venmoHandle}&amount=${amount}&note=Tip for ${worker.name}`;
      window.open(venmoUrl, '_blank');
      
      // Also provide fallback web link
      setTimeout(() => {
        const webUrl = `https://venmo.com/${worker.venmoHandle}`;
        window.open(webUrl, '_blank');
      }, 1000);

    } else if (paymentMethod === 'cashapp' && worker.cashappHandle) {
      // Open Cash App with pre-filled amount
      const cashappUrl = `https://cash.app/$${worker.cashappHandle}/${amount}`;
      window.open(cashappUrl, '_blank');

    } else if (paymentMethod === 'zelle' && worker.zelleHandle) {
      // For Zelle, just show the handle since it doesn't support deep links
      toast({
        title: "Send via Zelle",
        description: `Send $${amount} to: ${worker.zelleHandle}`,
      });
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
              ? "Processing..." 
              : `Open ${getPaymentMethodName()}`
            }
          </GradientButton>
          
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