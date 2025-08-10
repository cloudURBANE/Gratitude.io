import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { DollarSign, Sparkles } from 'lucide-react';

interface HoldToTipProps {
  onAmountSelected: (amount: number) => void;
  className?: string;
}

export function HoldToTip({ onAmountSelected, className = '' }: HoldToTipProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const holdTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 1], [1, 1.05]);
  const rotateRing = useTransform(progress, [0, 1], [0, 360]);

  const amounts = [5, 10, 15, 20, 25, 30, 40, 50];
  
  const startHold = useCallback(() => {
    if (isHolding) return;
    
    setIsHolding(true);
    holdTimeRef.current = 0;
    
    intervalRef.current = setInterval(() => {
      holdTimeRef.current += 50;
      const progressValue = Math.min(holdTimeRef.current / 2000, 1); // 2 second max hold
      progress.set(progressValue);
      
      // Calculate amount based on hold time
      const amountIndex = Math.floor(progressValue * amounts.length);
      const amount = amounts[Math.min(amountIndex, amounts.length - 1)];
      setSelectedAmount(amount);
      
      if (progressValue >= 1) {
        endHold();
      }
    }, 50);
  }, [isHolding, progress]);
  
  const endHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (selectedAmount > 0) {
      onAmountSelected(selectedAmount);
    }
    
    setIsHolding(false);
    setSelectedAmount(0);
    progress.set(0);
  }, [selectedAmount, onAmountSelected, progress]);

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Amount Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl font-bold text-white mb-2">
          ${selectedAmount || '0'}
        </div>
        <p className="text-gray-300 text-sm">
          {isHolding ? 'Hold to increase amount' : 'Hold the button below to select tip amount'}
        </p>
      </motion.div>

      {/* Hold Button */}
      <div className="relative">
        {/* Animated ring */}
        <motion.div
          style={{ rotate: rotateRing }}
          className="absolute inset-0 w-32 h-32 rounded-full"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="2"
              strokeDasharray={`${progress.get() * 301.59} 301.59`}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
        </motion.div>

        {/* Main button */}
        <motion.button
          style={{ scale }}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className={`
            relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-blue-600
            shadow-2xl shadow-green-500/25 border-4 border-white/20
            flex items-center justify-center transition-all duration-200
            ${isHolding ? 'shadow-3xl shadow-green-500/40' : 'hover:shadow-3xl hover:shadow-green-500/30'}
          `}
        >
          {/* Button content */}
          <div className="flex flex-col items-center">
            <DollarSign className="w-8 h-8 text-white mb-1" />
            <span className="text-white text-xs font-semibold">
              {isHolding ? 'HOLD' : 'HOLD TO TIP'}
            </span>
          </div>

          {/* Sparkle effects */}
          {isHolding && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-2 -left-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
            </>
          )}
        </motion.button>
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-3">
        {amounts.slice(0, 4).map((amount) => (
          <motion.button
            key={amount}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAmountSelected(amount)}
            className="w-16 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white font-semibold text-sm hover:bg-white/20 transition-all"
          >
            ${amount}
          </motion.button>
        ))}
      </div>
    </div>
  );
}