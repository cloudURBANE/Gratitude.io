import { cn } from "@/lib/utils";

interface TipPresetProps {
  amount: number;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TipPreset({ amount, label, isSelected, onSelect }: TipPresetProps) {
  return (
    <button 
      className={cn(
        "glass-card hover:border-accent-start focus-visible rounded-xl p-4 text-center transition-all duration-200 group",
        isSelected && "border-accent-start bg-glass-border"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "text-2xl font-semibold group-hover:text-accent-start transition-colors",
        isSelected ? "text-accent-start" : "text-text-primary"
      )}>
        ${amount}
      </div>
      <div className="text-xs text-text-secondary">{label}</div>
    </button>
  );
}
