import { motion } from "framer-motion";

interface MicroImpactBarProps {
  amount: number;
  workerName: string;
  className?: string;
}

export default function MicroImpactBar({ 
  amount, 
  workerName, 
  className = "" 
}: MicroImpactBarProps) {
  if (amount <= 0) {
    return null;
  }

  // Calculate impact metrics (realistic approximations)
  const getImpact = (tipAmount: number) => {
    const hourlyWage = 12; // Average service wage
    const rentGoalMonthly = 1200; // Typical rent goal
    const dailyGoal = rentGoalMonthly / 30;
    
    const workMinutes = Math.round((tipAmount / hourlyWage) * 60);
    const rentPercentage = Math.round((tipAmount / dailyGoal) * 100);
    const coffeeEquivalent = Math.floor(tipAmount / 5);
    
    // Choose most relevant impact message
    if (tipAmount >= 20) {
      return {
        icon: "🏠",
        text: `Covers ${rentPercentage}% of today's rent goal`,
        color: "text-green-400"
      };
    } else if (tipAmount >= 10) {
      return {
        icon: "⏰", 
        text: `Equals ${workMinutes} minutes of base pay`,
        color: "text-blue-400"
      };
    } else if (tipAmount >= 5) {
      return {
        icon: "☕",
        text: coffeeEquivalent > 0 ? `About ${coffeeEquivalent} coffee${coffeeEquivalent > 1 ? 's' : ''} worth` : "Covers a snack",
        color: "text-amber-400"
      };
    } else {
      return {
        icon: "✨",
        text: "Every dollar makes a difference",
        color: "text-purple-400"
      };
    }
  };

  const impact = getImpact(amount);

  return (
    <motion.div
      className={`flex items-center justify-center gap-2 py-2 px-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      key={`${amount}-${impact.text}`} // Re-animate when impact changes
    >
      <motion.span
        className="text-lg"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {impact.icon}
      </motion.span>
      
      <motion.p
        className={`text-sm font-medium ${impact.color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {impact.text}
      </motion.p>
    </motion.div>
  );
}