import { cn } from "@/lib/utils";

interface PaymentMethodProps {
  method: string;
  title: string;
  subtitle: string;
  icon: 'venmo' | 'cashapp' | 'zelle' | 'card';
  isSelected: boolean;
  onSelect: () => void;
}

const iconComponents = {
  venmo: (
    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
      <svg className="payment-icon text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.54 4.45c0.96 3.3-0.02 6.96-2.65 11.3h-3.84l-2.93-11.13-3.18 11.13H3.85L5.88 0.75h3.09c0.4 0 0.71 0.28 0.79 0.67l2.14 8.29c1.46-2.01 2.37-4.31 2.37-6.47 0-0.65-0.08-1.23-0.22-1.77h2.84c0.48 0 0.87 0.39 0.87 0.87v0.11z"/>
      </svg>
    </div>
  ),
  cashapp: (
    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
      <svg className="payment-icon text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.59 3.48c-.86 1.06-1.78 2.07-2.75 3.03-1.77 1.77-3.66 3.41-5.65 4.92-.8.6-1.63 1.16-2.48 1.68-.85.52-1.72 1-2.61 1.44-.89.44-1.8.84-2.72 1.2-.92.36-1.86.68-2.81.96-.95.28-1.91.52-2.88.72L.54 18.2c.43-.11.86-.24 1.28-.38.84-.28 1.67-.6 2.48-.95.81-.35 1.6-.73 2.37-1.14.77-.41 1.52-.85 2.25-1.32.73-.47 1.44-.96 2.13-1.48.69-.52 1.36-1.06 2.01-1.63.65-.57 1.28-1.16 1.89-1.77.61-.61 1.2-1.24 1.77-1.89.57-.65 1.11-1.32 1.63-2.01.52-.69 1.01-1.4 1.48-2.13.47-.73.91-1.48 1.32-2.25.41-.77.79-1.56 1.14-2.37.35-.81.67-1.64.95-2.48.14-.42.27-.85.38-1.28z"/>
      </svg>
    </div>
  ),
  zelle: (
    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
      <svg className="payment-icon text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8 10.5l2.5 2.5L8 15.5 5.5 13 8 10.5zm8 0L18.5 13 16 15.5l-2.5-2.5L16 10.5z"/>
      </svg>
    </div>
  ),
  card: (
    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
      <svg className="payment-icon text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
    </div>
  ),
};

export default function PaymentMethod({ 
  method, 
  title, 
  subtitle, 
  icon, 
  isSelected, 
  onSelect 
}: PaymentMethodProps) {
  return (
    <button 
      className={cn(
        "glass-card hover:border-accent-start focus-visible rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group w-full text-left",
        isSelected && "border-accent-start bg-glass-border"
      )}
      onClick={onSelect}
    >
      {iconComponents[icon]}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium group-hover:text-accent-start transition-colors truncate",
          isSelected ? "text-accent-start" : "text-text-primary"
        )}>
          {title}
        </div>
        <div className="text-xs text-text-secondary truncate">{subtitle}</div>
      </div>
    </button>
  );
}
