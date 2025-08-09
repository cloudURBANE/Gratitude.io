import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";

interface Worker {
  id: string;
  name: string;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleInfo?: string;
}

interface PaymentModalProps {
  worker: Worker;
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
  const [isProcessing, setIsProcessing] = useState(false);

  const getPaymentInfo = () => {
    switch (paymentMethod) {
      case 'venmo':
        return {
          title: 'Scan to pay with Venmo',
          handle: `@${worker.venmoHandle}`,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=venmo://paycharge?txn=pay&recipients=${worker.venmoHandle}&amount=${amount}`
        };
      case 'cashapp':
        return {
          title: 'Scan to pay with Cash App',
          handle: `$${worker.cashappHandle}`,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://cash.app/$${worker.cashappHandle}`
        };
      case 'zelle':
        return {
          title: 'Pay with Zelle',
          handle: worker.zelleInfo || '',
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${worker.zelleInfo}`
        };
      default:
        return {
          title: 'Payment',
          handle: '',
          qrUrl: ''
        };
    }
  };

  const paymentInfo = getPaymentInfo();

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(paymentInfo.handle).then(() => {
      toast({
        title: "Copied!",
        description: "Payment handle copied to clipboard.",
      });
    });
  };

  const handleOpenApp = () => {
    setIsProcessing(true);
    
    // Simulate app opening and payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <GlassCard className="rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center">
          {/* QR code for payment */}
          <img 
            src={paymentInfo.qrUrl || 'https://via.placeholder.com/200x200/7C3AED/FFFFFF?text=QR+Code'} 
            alt="QR code for payment" 
            className="w-32 h-32 mx-auto mb-4 rounded-lg bg-white p-2" 
          />
          
          <h3 className="text-xl font-semibold text-text-primary mb-2">{paymentInfo.title}</h3>
          <p className="text-text-secondary mb-4">${amount.toFixed(2)}</p>
          
          {paymentInfo.handle && (
            <GlassCard className="rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Handle:</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">{paymentInfo.handle}</span>
                  <button 
                    className="text-accent-start hover:text-accent-end transition-colors p-1 focus-visible" 
                    onClick={handleCopyHandle}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </GlassCard>
          )}
          
          <div className="flex gap-3">
            <GradientButton
              className="flex-1 py-3"
              onClick={handleOpenApp}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Open App'}
            </GradientButton>
            <button 
              className="flex-1 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200 focus-visible" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Close
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
