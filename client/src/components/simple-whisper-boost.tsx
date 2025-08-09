import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhisperBoostConfig } from "@/lib/tip-memory";

interface SimpleWhisperBoostProps {
  config: WhisperBoostConfig;
  currentAmount: number;
  onBoostChange: (boosted: boolean) => void;
  className?: string;
}

export default function SimpleWhisperBoost({ 
  config, 
  currentAmount, 
  onBoostChange, 
  className = "" 
}: SimpleWhisperBoostProps) {
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
      <button
        className="w-full p-3 rounded-xl bg-glass border border-glass-border hover:bg-glass-border transition-all duration-200 text-left"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simple checkbox */}
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                isEnabled
                  ? 'bg-accent-start border-accent-start'
                  : 'border-glass-border'
              }`}
            >
              {isEnabled && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

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
            {isEnabled && (
              <div className="text-xs text-text-secondary">
                Total: ${currentAmount + config.amount}
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}