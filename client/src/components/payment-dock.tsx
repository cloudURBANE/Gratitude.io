import { useState } from "react";
import { motion } from "framer-motion";

interface PaymentDockProps {
  amount: number;
  worker: any;
  onPaymentSelect: (method: string) => void;
  className?: string;
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
  primary: boolean;
}

export default function PaymentDock({ 
  amount, 
  worker, 
  onPaymentSelect, 
  className = "" 
}: PaymentDockProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Determine available payment methods based on worker's handles
  const getPaymentOptions = (): PaymentOption[] => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad/.test(ua);
    const isAndroid = /Android/.test(ua);
    
    return [
      {
        id: 'stripe',
        name: isIOS ? 'Apple Pay' : 'Card',
        description: isIOS ? 'Pay with Touch ID or Face ID' : 'Credit or debit card',
        available: true,
        primary: isIOS
      },
      {
        id: 'venmo',
        name: 'Venmo',
        description: worker?.venmoHandle ? `@${worker.venmoHandle}` : 'Popular with friends',
        available: !!worker?.venmoHandle,
        primary: !isIOS && !isAndroid
      },
      {
        id: 'cashapp',
        name: 'Cash App',
        description: worker?.cashappHandle ? `$${worker.cashappHandle}` : 'Send money instantly',
        available: !!worker?.cashappHandle,
        primary: isAndroid
      },
      {
        id: 'zelle',
        name: 'Zelle',
        description: worker?.zelleHandle || worker?.zelleEmail ? 'Bank to bank' : 'Use your banking app',
        available: !!(worker?.zelleHandle || worker?.zelleEmail),
        primary: false
      }
    ].filter(option => option.available)
     .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
  };

  const paymentOptions = getPaymentOptions();

  const handleMethodSelect = (option: PaymentOption) => {
    setSelectedMethod(option.id);
    
    setTimeout(() => {
      onPaymentSelect(option.id);
      setSelectedMethod(null);
    }, 200);
  };

  if (amount <= 0 || paymentOptions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-1">${amount}</div>
        <div className="text-text-secondary">for {worker.name}</div>
      </div>

      <div className="space-y-3">
        {paymentOptions.map((option, index) => (
          <motion.button
            key={option.id}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedMethod === option.id
                ? 'border-accent-start bg-accent-start/10 shadow-lg'
                : 'border-glass-border bg-glass hover:border-glass-border/50 hover:bg-glass-border/30'
            }`}
            onClick={() => handleMethodSelect(option)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={selectedMethod !== null}
          >
            <div className="flex items-center gap-4">
              {/* Payment method icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                option.id === 'stripe' ? 'bg-blue-500' :
                option.id === 'venmo' ? 'bg-blue-600' :
                option.id === 'cashapp' ? 'bg-green-500' :
                'bg-purple-500'
              }`}>
                {option.id === 'stripe' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                )}
                {option.id === 'venmo' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.83 4.17c1.12 1.61 1.62 3.72 1.62 6.61 0 7.72-4.17 12.95-8.61 12.95-1.72 0-3.11-.83-3.11-2.39 0-.61.17-1.45.5-2.5l1.89-9.17h4.17l-1.5 8.72c-.17.83-.28 1.39-.28 1.78 0 .61.28.83.72.83 1.61 0 3.33-2.72 3.33-7.22 0-2.11-.39-3.61-1.11-4.72L19.83 4.17z"/>
                  </svg>
                )}
                {option.id === 'cashapp' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.59 3.475c-.18.17-.43.27-.69.27-.26 0-.51-.1-.69-.27L20.49 1.71c-.37-.37-.88-.58-1.41-.58s-1.04.21-1.41.58L16.25 3.13c-.18.17-.43.27-.69.27s-.51-.1-.69-.27c-.37-.37-.37-.98 0-1.36L16.29.35c.75-.75 1.77-1.17 2.83-1.17s2.08.42 2.83 1.17l1.42 1.42c.38.37.38.98.01 1.36l.01-.01zM7.99 23.64c-1.06 0-2.08-.42-2.83-1.17L3.74 21.05c-.37-.37-.37-.98 0-1.36.18-.17.43-.27.69-.27.26 0 .51.1.69.27l1.42 1.42c.37.37.88.58 1.41.58s1.04-.21 1.41-.58l1.42-1.42c.18-.17.43-.27.69-.27s.51.1.69.27c.37.37.37.98 0 1.36L10.82 22.47c-.75.75-1.77 1.17-2.83 1.17z"/>
                  </svg>
                )}
                {option.id === 'zelle' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v3h4v4h-4v3z"/>
                  </svg>
                )}
              </div>

              {/* Payment method details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{option.name}</span>
                  {option.primary && (
                    <span className="px-2 py-0.5 bg-accent-start/20 text-accent-start text-xs rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-sm text-text-secondary">{option.description}</div>
              </div>

              {/* Loading or arrow */}
              {selectedMethod === option.id ? (
                <div className="w-5 h-5 border-2 border-accent-start border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Security note */}
      <div className="text-center text-xs text-text-secondary mt-6 opacity-70">
        Secure payment processing • No fees for tips under $50
      </div>
    </div>
  );
}