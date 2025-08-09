import { useState } from "react";
import { motion } from "framer-motion";

interface QuickTipProps {
  onAmountSelect: (amount: number) => void;
  selectedAmount: number;
  className?: string;
}

const PRESET_AMOUNTS = [5, 8, 12, 20];

export default function QuickTip({ onAmountSelect, selectedAmount, className = "" }: QuickTipProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetClick = (amount: number) => {
    onAmountSelect(amount);
    setShowCustom(false);
    setCustomAmount("");
  };

  const handleCustomSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount > 0) {
      onAmountSelect(amount);
      setShowCustom(false);
    }
  };

  const handleCustomChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preset amounts */}
      <div className="grid grid-cols-2 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={`relative py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              selectedAmount === amount
                ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow-lg'
                : 'bg-glass hover:bg-glass-border border border-glass-border text-text-primary'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ${amount}
            {selectedAmount === amount && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Custom amount toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
        >
          {showCustom ? "Choose preset amount" : "Enter custom amount"}
        </button>
      </div>

      {/* Custom amount input */}
      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-glass backdrop-blur-md border border-glass-border rounded-xl p-4"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-lg">$</span>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-transparent border border-glass-border rounded-lg text-lg font-medium text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCustomSubmit();
                  }
                }}
              />
            </div>
            <button
              onClick={handleCustomSubmit}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="px-6 py-3 bg-gradient-to-r from-accent-start to-accent-end rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              Set
            </button>
          </div>
        </motion.div>
      )}

      {/* Impact message */}
      {selectedAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-glass backdrop-blur-md border border-glass-border rounded-xl"
        >
          <div className="text-sm text-text-secondary mb-1">This tip covers</div>
          <div className="font-medium text-text-primary">
            {selectedAmount >= 15 ? "🍕 A meal" : 
             selectedAmount >= 10 ? "☕ Coffee for the team" :
             selectedAmount >= 5 ? "🥤 A drink" : "💝 A kind gesture"}
          </div>
        </motion.div>
      )}
    </div>
  );
}