import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ThumbDialProps {
  onAmountChange: (amount: number) => void;
  selectedAmount: number | null;
  customAmount: string;
  className?: string;
}

const PRESET_AMOUNTS = [3, 5, 10, 20];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100;

export default function ThumbDial({ onAmountChange, selectedAmount, customAmount, className }: ThumbDialProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(0);
  const dialRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const currentAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  // Convert amount to angle (0-360 degrees)
  const amountToAngle = (amount: number) => {
    return (amount / MAX_AMOUNT) * 270; // 270 degrees max for better UX
  };

  // Convert angle to amount
  const angleToAmount = (angle: number) => {
    return Math.max(MIN_AMOUNT, Math.round((angle / 270) * MAX_AMOUNT));
  };

  // Handle drag events
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    updateAngleFromPosition(clientX, clientY);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    updateAngleFromPosition(clientX, clientY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const updateAngleFromPosition = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    newAngle = (newAngle + 90 + 360) % 360; // Normalize to 0-360, start from top

    // Clamp to 270 degrees
    if (newAngle > 270) newAngle = 270;

    setAngle(newAngle);
    
    const amount = angleToAmount(newAngle);
    onAmountChange(amount);

    // Haptic feedback (Android only)
    if ('vibrate' in navigator && amount % 5 === 0) {
      navigator.vibrate(10);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Update angle when amount changes externally
  useEffect(() => {
    if (!isDragging && currentAmount > 0) {
      setAngle(amountToAngle(currentAmount));
    }
  }, [currentAmount, isDragging]);

  const handlePresetClick = (amount: number) => {
    onAmountChange(amount);
    setAngle(amountToAngle(amount));
  };

  const dialRotation = angle - 135; // Offset to start from top-left
  const progress = angle / 270;

  return (
    <div className={`relative ${className}`}>
      {/* Ambient halo */}
      <div className="absolute -z-10 inset-0">
        <motion.div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-gradient-to-r from-accent-start to-accent-end blur-3xl opacity-30"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.35, 0.25]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      <div 
        ref={dialRef}
        className="relative w-64 h-64 mx-auto"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Dial track */}
        <svg className="w-full h-full -rotate-45" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeDasharray="0 31.4"
            className="opacity-40"
          />
          
          {/* Progress track */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * 235.6} 235.6`}
            className="drop-shadow-lg transition-all duration-200"
            style={{
              filter: `drop-shadow(0 0 ${Math.min(progress * 20, 15)}px rgba(139, 69, 255, 0.6))`
            }}
          />
          
          <defs>
            <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b45ff" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dial thumb */}
        <motion.div
          className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-accent-start"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${dialRotation}deg) translateY(-50px)`,
          }}
          animate={{
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging 
              ? '0 0 20px rgba(139, 69, 255, 0.8)' 
              : '0 2px 10px rgba(0,0,0,0.3)'
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Center amount display */}
        <div 
          ref={centerRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div 
              className="text-4xl font-bold text-text-primary"
              animate={{ scale: isDragging ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
            >
              ${currentAmount.toFixed(2)}
            </motion.div>
            <div className="text-xs text-text-secondary mt-1 opacity-60">
              {isDragging ? 'Release to set' : 'Drag to adjust'}
            </div>
          </div>
        </div>

        {/* Preset chips */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-6 flex items-center justify-center">
            {PRESET_AMOUNTS.map((amount, index) => {
              const chipAngle = (index * 90) - 45; // Spread around the dial
              const isSelected = currentAmount === amount;
              
              return (
                <motion.button
                  key={amount}
                  className={`absolute w-12 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-accent-start text-white shadow-lg'
                      : 'bg-glass border border-glass-border text-text-secondary hover:bg-glass-border hover:text-text-primary'
                  }`}
                  style={{
                    transform: `rotate(${chipAngle}deg) translateY(-30px) rotate(-${chipAngle}deg)`,
                  }}
                  onClick={() => handlePresetClick(amount)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ${amount}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helper text */}
      {!isDragging && currentAmount === 0 && (
        <motion.p 
          className="text-center text-text-secondary text-sm mt-4 opacity-60"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Drag the ring or tap a preset amount
        </motion.p>
      )}
    </div>
  );
}