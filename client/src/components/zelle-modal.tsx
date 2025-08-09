import { useState } from "react";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";
import { useToast } from "@/hooks/use-toast";
import { ZelleIcon } from "./payment-app-icons";

interface ZelleModalProps {
  worker: {
    id: string;
    name: string;
    zelleHandle?: string;
  };
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ZelleModal({ worker, amount, onClose, onSuccess }: ZelleModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Zelle info copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the information",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    toast({
      title: "Thanks for your tip!",
      description: "Your payment helps support great service.",
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <ZelleIcon className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Send ${amount} via Zelle
          </h3>
          <p className="text-text-secondary">
            To {worker.name}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Amount */}
          <div className="bg-glass rounded-lg p-4">
            <div className="text-center">
              <div className="text-text-secondary text-sm mb-1">Amount to send:</div>
              <div className="text-3xl font-bold text-accent-start">${amount}</div>
            </div>
          </div>

          {/* Zelle recipient info */}
          <div className="bg-glass rounded-lg p-4">
            <div className="text-center">
              <div className="text-text-secondary text-sm mb-2">Send to:</div>
              <div className="text-text-primary font-semibold text-lg mb-3">
                {worker.zelleHandle}
              </div>
              <button
                onClick={() => handleCopy(worker.zelleHandle || '')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-start/20 hover:bg-accent-start/30 rounded-lg text-accent-start text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-glass rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-2">How to pay with Zelle:</h4>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
              <li>Open your banking app</li>
              <li>Find and tap "Zelle" or "Send Money"</li>
              <li>Enter the recipient info above</li>
              <li>Enter amount: ${amount}</li>
              <li>Add note: "Tip for {worker.name}"</li>
              <li>Send the payment</li>
            </ol>
          </div>
        </div>

        <div className="space-y-3">
          <GradientButton 
            className="w-full py-3"
            onClick={handleComplete}
          >
            I've sent the payment
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