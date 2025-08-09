import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GradientButton({ 
  children, 
  className, 
  disabled,
  ...props 
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "gradient-button rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 focus-visible disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
