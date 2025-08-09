// Authentic payment app icons as SVG components

export const VenmoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#008CFF"/>
    <path 
      d="M18.3 4.8c.9 1.5 1.2 3.3 1.2 5.4 0 5.4-4.5 10.5-8.1 10.5-1.8 0-2.7-1.2-2.7-2.7 0-.9.3-2.1.6-3.6l1.2-6.3h3.6l-.9 5.4c-.3 1.5-.3 2.1-.3 2.4 0 .6.3.9.6.9 1.2 0 2.7-2.7 2.7-6 0-1.5-.3-2.7-.9-3.6L18.3 4.8z" 
      fill="white"
    />
  </svg>
);

export const CashAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#00D632"/>
    <path 
      d="M19.5 9.6c0 .9-.6 1.5-1.5 1.5-.6 0-1.2-.3-1.5-.9-.6-1.2-1.8-1.8-3-1.8-1.2 0-1.8.6-1.8 1.2 0 .6.3.9 1.2 1.2l2.1.9c2.1.9 3 2.1 3 3.9 0 2.4-1.8 4.2-4.8 4.2-2.4 0-4.2-1.2-5.1-3.3-.3-.6-.3-1.2.3-1.8.6-.6 1.5-.6 2.1 0 .3.6.9.9 1.5.9.9 0 1.5-.3 1.5-1.2 0-.6-.3-.9-1.2-1.2l-2.1-.9c-2.1-.9-3-2.1-3-3.9 0-2.4 1.8-4.2 4.8-4.2 2.4 0 4.2 1.2 5.1 3.3.3.6.3 1.2-.3 1.8z" 
      fill="white"
    />
  </svg>
);

export const ZelleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#6D1ED4"/>
    <path 
      d="M4.5 6h15c.8 0 1.5.7 1.5 1.5v.3L12.8 16H4.5c-.8 0-1.5-.7-1.5-1.5V6zm15 12H4.5c-.8 0-1.5-.7-1.5-1.5v-.3L11.2 8h8.3c.8 0 1.5.7 1.5 1.5V18z" 
      fill="white"
    />
    <circle cx="12" cy="12" r="2" fill="white"/>
  </svg>
);

export const StripeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#635BFF"/>
    <path 
      d="M13.3 11.2c0-.8-.5-1.3-1.6-1.6l-1-.3c-2.1-.6-3.5-2.1-3.5-4.2C7.2 2.8 9.3 1 12.4 1c1.9 0 3.6.7 4.7 1.9l-1.6 1.9c-.8-.8-1.9-1.2-3.1-1.2-1.4 0-2.4.8-2.4 1.9 0 .9.6 1.4 1.8 1.7l1 .3c2.3.7 3.4 2.1 3.4 4.1 0 2.4-2.1 4.4-5.3 4.4-2.2 0-4.1-.9-5.3-2.4l1.8-1.8c1 1.1 2.3 1.7 3.5 1.7 1.6 0 2.6-.8 2.6-1.9v-.4z" 
      fill="white"
    />
  </svg>
);

export const BankIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#1F2937"/>
    <path 
      d="M12 3l9 4v2H3V7l9-4zm7 6v8h2v2H3v-2h2V9h2v8h2V9h2v8h2V9h2v8h2V9h2z" 
      fill="white"
    />
  </svg>
);

// Enhanced payment method component with authentic icons
interface PaymentMethodWithIconProps {
  method: 'venmo' | 'cashapp' | 'zelle' | 'stripe';
  isSelected: boolean;
  onClick: () => void;
  handle?: string;
  className?: string;
}

export const PaymentMethodWithIcon = ({ method, isSelected, onClick, handle, className }: PaymentMethodWithIconProps) => {
  const getIcon = () => {
    switch (method) {
      case 'venmo': return <VenmoIcon className="w-8 h-8" />;
      case 'cashapp': return <CashAppIcon className="w-8 h-8" />;
      case 'zelle': return <ZelleIcon className="w-8 h-8" />;
      case 'stripe': return <StripeIcon className="w-8 h-8" />;
      default: return <BankIcon className="w-8 h-8" />;
    }
  };

  const getName = () => {
    switch (method) {
      case 'venmo': return 'Venmo';
      case 'cashapp': return 'Cash App';
      case 'zelle': return 'Zelle';
      case 'stripe': return 'Card';
      default: return method;
    }
  };

  const getDescription = () => {
    if (handle) {
      return handle;
    }
    switch (method) {
      case 'venmo': return 'Fast & social';
      case 'cashapp': return 'Instant transfer';
      case 'zelle': return 'Bank to bank';
      case 'stripe': return 'Credit or debit';
      default: return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl border transition-all duration-200
        ${isSelected 
          ? 'border-accent-start bg-accent-start/10 shadow-lg' 
          : 'border-glass-border bg-glass hover:bg-glass-border'
        }
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div className="text-left flex-1">
          <div className="text-text-primary font-medium">{getName()}</div>
          <div className="text-text-secondary text-sm">{getDescription()}</div>
        </div>
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-accent-start"></div>
        )}
      </div>
    </button>
  );
};