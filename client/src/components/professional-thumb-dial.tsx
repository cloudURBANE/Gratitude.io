import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface ProfessionalThumbDialProps {
  onAmountChange: (amount: number) => void;
  selectedAmount?: number;
  customAmount?: string;
}

const PRESET_AMOUNTS = [
  { amount: 5, color: "from-blue-500 to-blue-600" },
  { amount: 8, color: "from-green-500 to-green-600" },
  { amount: 12, color: "from-amber-500 to-amber-600" },
  { amount: 20, color: "from-purple-500 to-purple-600" }
];

export default function ProfessionalThumbDial({ 
  onAmountChange, 
  selectedAmount, 
  customAmount 
}: ProfessionalThumbDialProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(customAmount || "");
  const dialRef = useRef<HTMLDivElement>(null);

  // Calculate angle for selected amount
  const getAngleForAmount = (amount: number): number => {
    const index = PRESET_AMOUNTS.findIndex(p => p.amount === amount);
    if (index === -1) return -90;
    return (index * 90) - 90; // Start from top, clockwise
  };

  const currentAngle = selectedAmount ? getAngleForAmount(selectedAmount) : -90;

  // Handle preset button clicks
  const handlePresetClick = useCallback((amount: number) => {
    onAmountChange(amount);
    // Simple haptic feedback on mobile
    if ('vibrate' in navigator && navigator.userAgent.includes('Mobile')) {
      navigator.vibrate(10);
    }
  }, [onAmountChange]);

  // Drag handling with performance optimizations
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateFromPosition(clientX, clientY);
  }, []);

  const updateFromPosition = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    // Snap to nearest preset with clear zones
    let targetAmount = 5;
    if (angle >= 315 || angle < 45) targetAmount = 5;
    else if (angle >= 45 && angle < 135) targetAmount = 8;
    else if (angle >= 135 && angle < 225) targetAmount = 12;
    else if (angle >= 225 && angle < 315) targetAmount = 20;
    
    if (selectedAmount !== targetAmount) {
      onAmountChange(targetAmount);
      // Subtle haptic on mobile only
      if ('vibrate' in navigator && navigator.userAgent.includes('Mobile')) {
        navigator.vibrate(8);
      }
    }
  }, [selectedAmount, onAmountChange]);

  // Event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updateFromPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        updateFromPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
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
  }, [isDragging, updateFromPosition]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Dial Container */}
      <div className="relative">
        <div 
          ref={dialRef}
          className="relative w-72 h-72"
        >
          {/* Simple track ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          
          {/* Progress indicator */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={2 * Math.PI * 44 * (1 - ((currentAngle + 90) % 360) / 360)}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient">
                <stop offset="0%" stopColor="#8b45ff" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center display */}
          <div 
            className="absolute inset-12 rounded-full bg-white/8 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.4)'
            }}
          >
            <motion.div
              className="text-4xl font-bold text-white mb-1"
              key={selectedAmount || 0}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              ${selectedAmount || '0'}
            </motion.div>
            <div className="text-sm text-white/60">Tip Amount</div>
          </div>

          {/* Preset buttons with proper spacing */}
          {PRESET_AMOUNTS.map((preset, index) => {
            const angle = (index * 90) - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 120; // Optimized distance
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            const isSelected = selectedAmount === preset.amount;
            
            return (
              <button
                key={preset.amount}
                className={`absolute w-14 h-14 rounded-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-br ${preset.color} text-white shadow-lg scale-105`
                    : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 hover:scale-105'
                }`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  boxShadow: isSelected 
                    ? '0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 4px 15px rgba(0,0,0,0.2)'
                }}
                onClick={() => handlePresetClick(preset.amount)}
              >
                ${preset.amount}
              </button>
            );
          })}

          {/* Simple drag handle */}
          <motion.div
            className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{
              left: `calc(50% + ${Math.cos(currentAngle * Math.PI / 180) * 96}px)`,
              top: `calc(50% + ${Math.sin(currentAngle * Math.PI / 180) * 96}px)`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 15px rgba(0,0,0,0.3)'
            }}
            animate={{
              scale: isDragging ? 1.2 : 1,
            }}
            transition={{ duration: 0.15 }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            whileHover={{ scale: 1.1 }}
          >
            <div className="absolute inset-0.5 rounded-full bg-white/20" />
          </motion.div>
        </div>
      </div>

      {/* Custom amount input */}
      {showCustomInput ? (
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white/8 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg">$</span>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 pl-8 pr-4 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
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
              className="mt-3 w-full text-white/60 hover:text-white/80 text-sm transition-colors"
            >
              Back to presets
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
          onClick={() => setShowCustomInput(true)}
        >
          Enter custom amount
        </button>
      )}
    </div>
  );
}