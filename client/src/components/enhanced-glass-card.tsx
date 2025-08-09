import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EnhancedGlassCardProps {
  children: ReactNode;
  className?: string;
  depth?: 'base' | 'interactive' | 'modal';
  glowIntensity?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export default function EnhancedGlassCard({ 
  children, 
  className = "", 
  depth = 'base',
  glowIntensity = 0,
  onClick,
  disabled = false
}: EnhancedGlassCardProps) {
  const getGlassStyles = () => {
    const baseStyles = "backdrop-blur-md border border-glass-border";
    
    switch (depth) {
      case 'base':
        return `${baseStyles} bg-white/6`;
      case 'interactive':
        return `${baseStyles} bg-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]`;
      case 'modal':
        return `${baseStyles} bg-white/8 ring-2 ring-accent-start/20`;
      default:
        return `${baseStyles} bg-white/6`;
    }
  };

  const glowStyle = glowIntensity > 0 ? {
    boxShadow: `0 0 ${Math.min(glowIntensity * 30, 40)}px rgba(139, 69, 255, ${Math.min(glowIntensity * 0.3, 0.4)})`
  } : {};

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`
        relative rounded-xl overflow-hidden transition-all duration-200
        ${getGlassStyles()}
        ${onClick && !disabled ? 'cursor-pointer hover:bg-white/10' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      style={glowStyle}
      onClick={onClick && !disabled ? onClick : undefined}
      whileHover={onClick && !disabled ? { scale: 1.02 } : undefined}
      whileTap={onClick && !disabled ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Shimmer effect on hover for interactive cards */}
      {onClick && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
          whileHover={{
            translateX: '200%',
            transition: { duration: 0.6, ease: "easeOut" }
          }}
        />
      )}
      
      {children}
    </Component>
  );
}