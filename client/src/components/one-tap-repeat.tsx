import { motion } from "framer-motion";
import EnhancedPaymentButton from "./enhanced-payment-button";
import { TipMemory } from "@/lib/tip-memory";

interface OneTapRepeatProps {
  memory: TipMemory;
  onRepeat: () => void;
  onChangeAmount: () => void;
  className?: string;
}

export default function OneTapRepeat({ 
  memory, 
  onRepeat, 
  onChangeAmount, 
  className = "" 
}: OneTapRepeatProps) {
  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case 'venmo': return 'Venmo';
      case 'cashapp': return 'Cash App';
      case 'zelle': return 'Zelle';
      case 'stripe': return 'Card';
      default: return 'Card';
    }
  };

  const timeSinceLastTip = (): string => {
    const now = Date.now();
    const diff = now - memory.timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
      return 'recently';
    }
  };

  return (
    <motion.div 
      className={`bg-gradient-to-r from-accent-start/10 to-accent-end/10 rounded-2xl p-6 mb-6 border border-accent-start/20 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute -inset-2 -z-10 rounded-2xl blur-xl opacity-20"
        style={{
          background: `linear-gradient(135deg, #8b45ff40, #06b6d440)`,
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-12 h-12 bg-gradient-to-r from-accent-start to-accent-end rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.div>
        
        <h3 className="text-xl font-bold text-text-primary mb-2">
          Welcome back!
        </h3>
        
        <p className="text-text-secondary text-sm">
          You tipped ${memory.amount} via {getPaymentMethodName(memory.method)} {timeSinceLastTip()}
        </p>
      </div>

      <div className="space-y-3">
        {/* One-tap repeat button */}
        <EnhancedPaymentButton
          onClick={onRepeat}
          paymentMethod={memory.method}
          amount={memory.amount}
          className="text-lg font-bold"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tip ${memory.amount} again</span>
          </div>
        </EnhancedPaymentButton>

        {/* Change amount link */}
        <button
          onClick={onChangeAmount}
          className="w-full py-2 text-text-secondary hover:text-text-primary text-sm transition-colors underline"
        >
          or choose a different amount
        </button>
      </div>
    </motion.div>
  );
}