import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HoldToTipProps {
  onAmountSelected: (amount: number) => void;
  className?: string;
  minAmount?: number;
  maxAmount?: number;
}

export function HoldToTip({
  onAmountSelected,
  className,
  minAmount = 1,
  maxAmount = 50
}: HoldToTipProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const scale = useTransform(y, [-100, 0], [1.2, 1]);
  const opacity = useTransform(y, [-100, 0], [1, 0.7]);
  const amount = useTransform(y, [-200, 0], [maxAmount, minAmount]);

  const handleStart = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleEnd = useCallback(() => {
    setIsPressed(false);
    if (selectedAmount >= minAmount) {
      onAmountSelected(selectedAmount);
    }
    y.set(0);
    setSelectedAmount(0);
  }, [selectedAmount, minAmount, onAmountSelected, y]);

  const handleDrag = useCallback(() => {
    const currentAmount = Math.round(amount.get() * 4) / 4; // Round to quarters
    setSelectedAmount(Math.max(minAmount, Math.min(maxAmount, currentAmount)));
  }, [amount, minAmount, maxAmount]);

  return (
    <div className={cn("relative flex justify-center", className)}>
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        
        {/* Progress ring */}
        {isPressed && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="60"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeDasharray={`${(selectedAmount / maxAmount) * 377} 377`}
              className="transition-all duration-150"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Center button */}
        <motion.div
          ref={containerRef}
          className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg cursor-pointer select-none flex items-center justify-center"
          style={{ scale, opacity }}
          drag="y"
          dragConstraints={{ top: -200, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={handleStart}
          onDragEnd={handleEnd}
          onDrag={handleDrag}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-white text-center">
            {isPressed && selectedAmount > 0 ? (
              <div>
                <div className="text-xs font-medium">Tip</div>
                <div className="text-lg font-bold">${selectedAmount.toFixed(2)}</div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-medium">Hold</div>
                <div className="text-lg font-bold">& Drag</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Amount display */}
        {isPressed && selectedAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          >
            <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
              ${selectedAmount.toFixed(2)}
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground">
          {isPressed ? 'Release to confirm' : 'Hold and drag up to increase'}
        </p>
      </div>
    </div>
  );
}