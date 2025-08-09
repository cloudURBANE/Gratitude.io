import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Zap, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";
import { cn } from "@/lib/utils";

interface QuickTipProps {
  onAmountSelected: (amount: number) => void;
  className?: string;
}

const QUICK_AMOUNTS = [
  { amount: 3, icon: Coffee, label: "Coffee", color: "from-amber-500 to-yellow-600" },
  { amount: 5, icon: Heart, label: "Thanks", color: "from-pink-500 to-rose-600" },
  { amount: 10, icon: Zap, label: "Great", color: "from-blue-500 to-indigo-600" },
  { amount: 20, icon: DollarSign, label: "Amazing", color: "from-green-500 to-emerald-600" },
];

export default function QuickTip({ onAmountSelected, className }: QuickTipProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onAmountSelected(amount);
      setSelectedAmount(null);
    }, 150);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <GlassCard className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Tip</h3>
          <p className="text-sm text-gray-300">
            Select an amount or use the Snake game below
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_AMOUNTS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedAmount === item.amount;
            
            return (
              <motion.div
                key={item.amount}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  onClick={() => handleAmountClick(item.amount)}
                  className={cn(
                    "w-full h-20 flex flex-col items-center justify-center gap-2 text-white border-0 transition-all duration-200",
                    `bg-gradient-to-br ${item.color}`,
                    isSelected && "ring-2 ring-white/50 scale-95"
                  )}
                  disabled={isSelected}
                >
                  <Icon size={20} />
                  <div className="text-center">
                    <div className="font-bold">${item.amount}</div>
                    <div className="text-xs opacity-90">{item.label}</div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Or play the Snake game below to collect custom tip amounts!
          </p>
        </div>
      </GlassCard>
    </div>
  );
}