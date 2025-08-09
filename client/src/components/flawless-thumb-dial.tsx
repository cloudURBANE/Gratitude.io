import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlawlessThumbDialProps {
  onAmountChange: (amount: number) => void;
  selectedAmount?: number;
  customAmount?: string;
}

const PRESET_AMOUNTS = [
  { amount: 5, label: "Quick", color: "#3B82F6", shadow: "rgba(59, 130, 246, 0.4)" },
  { amount: 8, label: "Good", color: "#10B981", shadow: "rgba(16, 185, 129, 0.4)" },
  { amount: 12, label: "Great", color: "#F59E0B", shadow: "rgba(245, 158, 11, 0.4)" },
  { amount: 20, label: "Amazing", color: "#8B5CF6", shadow: "rgba(139, 92, 246, 0.4)" }
];

export default function FlawlessThumbDial({ onAmountChange, selectedAmount, customAmount }: FlawlessThumbDialProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(customAmount || "");
  const [rippleEffect, setRippleEffect] = useState<{x: number, y: number} | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  // Haptic feedback for mobile devices
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, []);

  // Calculate angle for amount positioning
  const getAngleForAmount = (amount: number): number => {
    const index = PRESET_AMOUNTS.findIndex(p => p.amount === amount);
    if (index === -1) return -90; // Default to top
    return (index * 90) - 90; // Start from top (-90°), go clockwise
  };

  const currentAngle = selectedAmount ? getAngleForAmount(selectedAmount) : -90;
  const selectedPreset = PRESET_AMOUNTS.find(p => p.amount === selectedAmount);

  const handlePresetClick = (amount: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRippleEffect({
      x: rect.width / 2,
      y: rect.height / 2
    });
    
    setTimeout(() => setRippleEffect(null), 600);
    
    onAmountChange(amount);
    triggerHaptic();
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateFromPosition(clientX, clientY);
  };

  const updateFromPosition = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    // Snap to nearest preset with generous ranges
    let targetAmount = 5; // Default
    
    if (angle >= 315 || angle < 45) targetAmount = 5;      // Top quadrant
    else if (angle >= 45 && angle < 135) targetAmount = 8;  // Right quadrant  
    else if (angle >= 135 && angle < 225) targetAmount = 12; // Bottom quadrant
    else if (angle >= 225 && angle < 315) targetAmount = 20; // Left quadrant
    
    if (selectedAmount !== targetAmount) {
      onAmountChange(targetAmount);
      triggerHaptic();
    }
  };

  // Event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateFromPosition(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        updateFromPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center">
      {/* Ambient Background Glow */}
      <motion.div
        className="absolute -inset-12 rounded-full opacity-20 pointer-events-none"
        style={{
          background: selectedPreset 
            ? `radial-gradient(circle, ${selectedPreset.shadow} 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(139, 69, 255, 0.3) 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
        animate={{
          scale: isDragging ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: isDragging ? 0.8 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Dial Container */}
      <div className="relative">
        <div 
          ref={dialRef}
          className="relative w-96 h-96"
        >
          {/* Outer Progress Ring */}
          <div className="absolute inset-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background track with subtle inner glow */}
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="6"
              />
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2"
              />
              
              {/* Active progress arc */}
              <motion.circle
                cx="60"
                cy="60"
                r="55"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 55}`}
                className="filter drop-shadow-lg"
                initial={false}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 55 * (1 - ((currentAngle + 90) % 360) / 360),
                }}
                transition={{ 
                  duration: isDragging ? 0.1 : 0.6, 
                  ease: isDragging ? "easeOut" : "easeInOut" 
                }}
              />

              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={selectedPreset?.color || "#8b45ff"} />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center Display with Enhanced Glass Effect */}
          <motion.div 
            className="absolute inset-16 rounded-full flex flex-col items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.12) 0%, 
                rgba(255, 255, 255, 0.06) 50%, 
                rgba(255, 255, 255, 0.08) 100%)`,
              backdropFilter: 'blur(24px)',
              border: '2px solid rgba(255, 255, 255, 0.18)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(255, 255, 255, 0.05),
                0 25px 50px rgba(0, 0, 0, 0.5),
                0 8px 16px rgba(0, 0, 0, 0.3)
              `
            }}
            animate={{
              scale: isDragging ? 1.02 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Inner shine effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 20%, 
                  rgba(255, 255, 255, 0.4) 0%, 
                  transparent 50%)`
              }}
            />
            
            <motion.div
              className="relative text-6xl font-black tracking-tight mb-2"
              style={{
                background: selectedPreset 
                  ? `linear-gradient(135deg, ${selectedPreset.color}, #06b6d4)`
                  : 'linear-gradient(135deg, #8b45ff, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
              key={selectedAmount || 0}
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            >
              ${selectedAmount || '0'}
            </motion.div>
            
            <motion.div 
              className="text-sm font-bold tracking-wider uppercase opacity-75"
              style={{ color: selectedPreset?.color || '#8b45ff' }}
              animate={{ opacity: selectedAmount ? 0.8 : 0.5 }}
            >
              {selectedPreset?.label || 'Select Amount'}
            </motion.div>
          </motion.div>

          {/* Preset Amount Buttons with Perfect Spacing */}
          {PRESET_AMOUNTS.map((preset, index) => {
            const angle = (index * 90) - 90; // Start from top
            const radian = (angle * Math.PI) / 180;
            const radius = 150; // Perfect distance from center
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            const isSelected = selectedAmount === preset.amount;
            
            return (
              <motion.button
                key={preset.amount}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                onClick={(e) => handlePresetClick(preset.amount, e)}
                initial={false}
                animate={{
                  scale: isSelected ? 1.15 : 1,
                }}
                whileHover={{ 
                  scale: isSelected ? 1.2 : 1.08,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                {/* Button Background with Glass Effect */}
                <div
                  className="relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: isSelected 
                      ? `linear-gradient(135deg, ${preset.color}, ${preset.color}dd)`
                      : `linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.12), 
                          rgba(255, 255, 255, 0.08))`,
                    backdropFilter: 'blur(16px)',
                    border: isSelected 
                      ? `2px solid ${preset.color}` 
                      : '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: isSelected
                      ? `0 8px 32px ${preset.shadow}, 
                         inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                      : `inset 0 1px 0 rgba(255, 255, 255, 0.15),
                         0 4px 20px rgba(0, 0, 0, 0.3)`
                  }}
                >
                  {/* Ripple effect */}
                  <AnimatePresence>
                    {rippleEffect && (
                      <motion.div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          left: rippleEffect.x - 20,
                          top: rippleEffect.y - 20,
                          width: 40,
                          height: 40,
                          background: `radial-gradient(circle, ${preset.color}40 0%, transparent 70%)`,
                        }}
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Inner highlight */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-20"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, 
                        rgba(255, 255, 255, 0.6) 0%, 
                        transparent 50%)`
                    }}
                  />
                  
                  <span 
                    className={`relative text-xl font-black transition-colors duration-200 ${
                      isSelected ? 'text-white' : 'text-text-primary'
                    }`}
                  >
                    ${preset.amount}
                  </span>
                  <span 
                    className={`relative text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ${
                      isSelected ? 'text-white opacity-90' : 'text-text-secondary'
                    }`}
                  >
                    {preset.label}
                  </span>
                </div>
              </motion.button>
            );
          })}

          {/* Enhanced Drag Handle */}
          <motion.div
            className="absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{
              left: `calc(50% + ${Math.cos(currentAngle * Math.PI / 180) * 108}px)`,
              top: `calc(50% + ${Math.sin(currentAngle * Math.PI / 180) * 108}px)`,
            }}
            animate={{
              scale: isDragging ? 1.4 : 1.2,
              rotate: isDragging ? 360 : 0,
            }}
            transition={{ 
              duration: isDragging ? 2 : 0.4,
              repeat: isDragging ? Infinity : 0,
              ease: isDragging ? "linear" : "easeOut"
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            whileHover={{ scale: 1.3 }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, 
                  ${selectedPreset?.shadow || 'rgba(139, 69, 255, 0.4)'} 0%, 
                  transparent 70%)`,
                filter: 'blur(8px)',
              }}
            />
            
            {/* Main handle */}
            <div
              className="relative w-full h-full rounded-full"
              style={{
                background: selectedPreset 
                  ? `linear-gradient(135deg, ${selectedPreset.color}, #06b6d4)`
                  : 'linear-gradient(135deg, #8b45ff, #06b6d4)',
                boxShadow: `
                  inset 0 2px 4px rgba(255, 255, 255, 0.3),
                  0 4px 20px ${selectedPreset?.shadow || 'rgba(139, 69, 255, 0.5)'},
                  0 2px 8px rgba(0, 0, 0, 0.3)
                `
              }}
            >
              {/* Inner shine */}
              <div 
                className="absolute inset-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Amount Toggle with Enhanced Styling */}
      <div className="mt-12 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {showCustomInput ? (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div 
                className="glass-modal rounded-3xl p-8"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.12) 0%, 
                    rgba(255, 255, 255, 0.08) 100%)`,
                }}
              >
                <label className="block text-lg font-bold text-text-primary mb-4 text-center">
                  Custom Amount
                </label>
                <div className="relative mb-6">
                  <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-text-primary text-2xl font-bold">$</span>
                  <input
                    type="number"
                    className="w-full bg-transparent border-2 border-glass-border rounded-2xl py-5 pl-14 pr-6 text-text-primary text-xl font-bold placeholder-text-secondary focus:border-accent-start focus:outline-none transition-all duration-300"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      const amount = parseFloat(e.target.value);
                      if (amount > 0) {
                        onAmountChange(amount);
                      }
                    }}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomValue("");
                  }}
                  className="w-full py-3 text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors duration-300 underline underline-offset-4"
                >
                  Back to presets
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              className="text-text-secondary hover:text-accent-start text-sm font-semibold underline underline-offset-4 transition-all duration-300 mx-auto block"
              onClick={() => setShowCustomInput(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              Enter custom amount
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}