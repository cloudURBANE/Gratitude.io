import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EnhancedPaymentButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  paymentMethod?: 'venmo' | 'cashapp' | 'zelle' | 'stripe';
  amount?: number;
  className?: string;
}

const PAYMENT_COLORS = {
  venmo: { from: '#008CFF', to: '#0066CC' },
  cashapp: { from: '#00D632', to: '#00A827' },
  zelle: { from: '#6D1ED4', to: '#5A1AB0' },
  stripe: { from: '#635BFF', to: '#5147E5' },
};

export default function EnhancedPaymentButton({
  children,
  onClick,
  disabled = false,
  paymentMethod,
  amount = 0,
  className = ""
}: EnhancedPaymentButtonProps) {
  const getHaloColor = () => {
    if (paymentMethod && PAYMENT_COLORS[paymentMethod]) {
      return PAYMENT_COLORS[paymentMethod];
    }
    return { from: '#8b45ff', to: '#06b6d4' };
  };

  const { from: haloFrom, to: haloTo } = getHaloColor();
  const glowIntensity = Math.min(amount / 50, 1); // Scale with amount, cap at $50

  return (
    <div className="relative">
      {/* Ambient halo that reacts to payment method and amount */}
      <motion.div
        className="absolute -inset-4 -z-10 rounded-xl blur-xl opacity-0"
        style={{
          background: `linear-gradient(135deg, ${haloFrom}40, ${haloTo}40)`,
        }}
        animate={{
          opacity: disabled ? 0 : 0.25 + (glowIntensity * 0.15),
          scale: [1, 1.02, 1],
        }}
        transition={{
          opacity: { duration: 0.8, ease: "easeOut" },
          scale: { 
            duration: paymentMethod ? 3.5 : 4.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }}
      />

      {/* Payment method color flash */}
      {paymentMethod && (
        <motion.div
          className="absolute -inset-2 -z-10 rounded-xl blur-lg"
          style={{
            background: `linear-gradient(135deg, ${haloFrom}60, ${haloTo}60)`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0.8, 1.1, 1]
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}

      <motion.button
        className={`
          relative w-full py-4 px-6 rounded-xl font-semibold text-white
          bg-gradient-to-r from-accent-start to-accent-end
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] 
          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-accent-start/50
          disabled:opacity-60 disabled:cursor-not-allowed
          active:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]
          ${className}
        `}
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { 
          scale: 1.02,
          boxShadow: "0 15px 40px rgba(0,0,0,0.4)"
        } : undefined}
        whileTap={!disabled ? { 
          scale: 0.98,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
        } : undefined}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full rounded-xl"
          whileHover={!disabled ? {
            translateX: '200%',
            transition: { duration: 0.6, ease: "easeOut" }
          } : undefined}
        />
        
        {children}
      </motion.button>
    </div>
  );
}