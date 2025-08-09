import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhisperBoostConfig } from "@/lib/tip-memory";

interface WhisperBoostProps {
  config: WhisperBoostConfig;
  currentAmount: number;
  onBoostChange: (boosted: boolean) => void;
  className?: string;
}

export default function WhisperBoost({ 
  config, 
  currentAmount, 
  onBoostChange, 
  className = "" 
}: WhisperBoostProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onBoostChange(newState);
  };

  if (!config.enabled || currentAmount === 0) {
    return null;
  }

  return (
    <motion.div 
      className={`mb-4 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        className="w-full p-3 rounded-xl bg-glass border border-glass-border hover:bg-glass-border transition-all duration-200 text-left"
        onClick={handleToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Custom checkbox */}
            <motion.div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isEnabled
                  ? 'bg-accent-start border-accent-start'
                  : 'border-glass-border'
              }`}
              animate={{
                backgroundColor: isEnabled ? '#8b45ff' : 'transparent',
                borderColor: isEnabled ? '#8b45ff' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <AnimatePresence>
                {isEnabled && (
                  <motion.svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>

            <div>
              <p className="text-sm font-medium text-text-primary">
                {config.message}
              </p>
              <p className="text-xs text-text-secondary">
                Optional support for platform costs
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-accent-start">
              +${config.amount}
            </div>
            <AnimatePresence>
              {isEnabled && (
                <motion.div
                  className="text-xs text-text-secondary"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  Total: ${currentAmount + config.amount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}