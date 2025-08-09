import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface HoldToTipProps {
  onAmountChange: (amount: number) => void;
  selectedAmount?: number;
  lastTipAmount?: number;
  className?: string;
}

export default function HoldToTip({ 
  onAmountChange, 
  selectedAmount = 0, 
  lastTipAmount,
  className = "" 
}: HoldToTipProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdAmount, setHoldAmount] = useState(selectedAmount);
  const [ringProgress, setRingProgress] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  
  const holdRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startAmountRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();
  const announceTimeoutRef = useRef<NodeJS.Timeout>();

  // Convert amount to ring progress (0-1)
  const getProgressFromAmount = (amount: number): number => {
    return Math.min(amount / 50, 1); // Max $50 for full ring
  };

  // Announce amount changes for accessibility
  const announceAmount = useCallback((amount: number) => {
    if (announceTimeoutRef.current) clearTimeout(announceTimeoutRef.current);
    announceTimeoutRef.current = setTimeout(() => {
      const message = `Amount set to $${amount}`;
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }, 500);
  }, []);

  // Haptic feedback for mobile
  const hapticTick = useCallback(() => {
    if ('vibrate' in navigator && /Android|iPhone|iPad/.test(navigator.userAgent)) {
      navigator.vibrate(8);
    }
  }, []);

  // Handle tap gestures
  const handleTap = useCallback(() => {
    setTapCount(prev => prev + 1);
    
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    
    tapTimeoutRef.current = setTimeout(() => {
      if (tapCount === 1) {
        // Single tap - do nothing, let normal interaction happen
      } else if (tapCount === 2 && lastTipAmount) {
        // Double tap - repeat last tip
        const newAmount = lastTipAmount;
        setHoldAmount(newAmount);
        onAmountChange(newAmount);
        announceAmount(newAmount);
        hapticTick();
      } else if (tapCount === 3 && lastTipAmount) {
        // Triple tap - last tip + $1
        const newAmount = lastTipAmount + 1;
        setHoldAmount(newAmount);
        onAmountChange(newAmount);
        announceAmount(newAmount);
        hapticTick();
      }
      setTapCount(0);
    }, 300);
  }, [tapCount, lastTipAmount, onAmountChange, announceAmount, hapticTick]);

  // Handle hold start
  const handleHoldStart = useCallback((clientY: number) => {
    setIsHolding(true);
    startYRef.current = clientY;
    startAmountRef.current = holdAmount || selectedAmount || 5;
    hapticTick();
  }, [holdAmount, selectedAmount, hapticTick]);

  // Handle hold move
  const handleHoldMove = useCallback((clientY: number) => {
    if (!isHolding) return;
    
    const deltaY = startYRef.current - clientY; // Negative when moving up
    const dollarPerPixel = 0.1; // $0.10 per pixel
    const rawAmount = startAmountRef.current + (deltaY * dollarPerPixel);
    
    // Snap to nearest dollar and clamp
    const snappedAmount = Math.max(1, Math.min(100, Math.round(rawAmount)));
    
    if (snappedAmount !== holdAmount) {
      setHoldAmount(snappedAmount);
      setRingProgress(getProgressFromAmount(snappedAmount));
      hapticTick();
    }
  }, [isHolding, holdAmount, hapticTick]);

  // Handle hold end
  const handleHoldEnd = useCallback(() => {
    if (isHolding) {
      setIsHolding(false);
      onAmountChange(holdAmount);
      announceAmount(holdAmount);
    }
  }, [isHolding, holdAmount, onAmountChange, announceAmount]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleHoldStart(e.clientY);
    handleTap();
  }, [handleHoldStart, handleTap]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleHoldMove(e.clientY);
  }, [handleHoldMove]);

  const handleMouseUp = useCallback(() => {
    handleHoldEnd();
  }, [handleHoldEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleHoldStart(touch.clientY);
    handleTap();
  }, [handleHoldStart, handleTap]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      handleHoldMove(e.touches[0].clientY);
    }
  }, [handleHoldMove]);

  const handleTouchEnd = useCallback(() => {
    handleHoldEnd();
  }, [handleHoldEnd]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newAmount = holdAmount;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newAmount = Math.min(100, holdAmount + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newAmount = Math.max(1, holdAmount - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onAmountChange(holdAmount);
        announceAmount(holdAmount);
        return;
    }
    
    if (newAmount !== holdAmount) {
      setHoldAmount(newAmount);
      setRingProgress(getProgressFromAmount(newAmount));
      hapticTick();
    }
  }, [holdAmount, onAmountChange, announceAmount, hapticTick]);

  // Global event listeners
  useEffect(() => {
    if (isHolding) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isHolding, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Update internal state when prop changes
  useEffect(() => {
    if (selectedAmount !== holdAmount) {
      setHoldAmount(selectedAmount);
      setRingProgress(getProgressFromAmount(selectedAmount));
    }
  }, [selectedAmount, holdAmount]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      if (announceTimeoutRef.current) clearTimeout(announceTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Hold area */}
      <div
        ref={holdRef}
        className="relative w-full bg-glass rounded-2xl p-8 cursor-pointer select-none touch-none"
        style={{ minHeight: '200px' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Hold and drag to set tip amount"
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={holdAmount}
        aria-valuetext={`$${holdAmount}`}
      >
        {/* Hold ring - appears on hold */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: isHolding ? 1 : 0, 
            scale: isHolding ? 1 : 0.95 
          }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            
            {/* Liquid gradient ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#liquidGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={2 * Math.PI * 45 * (1 - ringProgress)}
              className="transition-all duration-100"
            />
            
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b45ff" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Amount display */}
        <div className="relative flex flex-col items-center justify-center h-full">
          <motion.div
            className="text-5xl font-bold text-text-primary mb-2"
            key={holdAmount}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            ${holdAmount}
          </motion.div>
          
          <div className="text-sm text-text-secondary text-center">
            {isHolding ? (
              "Slide up/down to adjust"
            ) : (
              <>
                Hold & drag to set amount
                {lastTipAmount && (
                  <div className="mt-1 text-xs opacity-75">
                    Double-tap: ${lastTipAmount} • Triple-tap: ${lastTipAmount + 1}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Visual feedback for holding */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-accent-start/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHolding ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        />
      </div>

      {/* Preset fallback chips */}
      <div className="flex justify-center gap-2 mt-4">
        {[3, 5, 10, 20].map(amount => (
          <button
            key={amount}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              holdAmount === amount
                ? 'bg-accent-start text-white'
                : 'bg-glass border border-glass-border text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setHoldAmount(amount);
              onAmountChange(amount);
              announceAmount(amount);
              hapticTick();
            }}
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
}