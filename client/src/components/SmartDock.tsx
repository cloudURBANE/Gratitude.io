import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Zap,
  Check,
  ExternalLink,
  X
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  available: boolean;
  recommended?: boolean;
  deepLink?: string;
}

interface SmartDockProps {
  amount: number;
  onPaymentMethodSelected: (method: string, amount: number) => void;
  onClose: () => void;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleHandle?: string;
}

export function SmartDock({ 
  amount, 
  onPaymentMethodSelected, 
  onClose,
  venmoHandle,
  cashappHandle,
  zelleHandle 
}: SmartDockProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect device capabilities
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit Card',
      icon: CreditCard,
      color: 'bg-blue-500',
      available: true,
      recommended: !isMobile
    },
    {
      id: 'venmo',
      name: 'Venmo',
      icon: Smartphone,
      color: 'bg-blue-600',
      available: !!venmoHandle && isMobile,
      recommended: isMobile && !!venmoHandle,
      deepLink: venmoHandle ? `venmo://paycharge?txn=pay&recipients=${venmoHandle}&amount=${amount}&note=Tip` : undefined
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      icon: DollarSign,
      color: 'bg-green-500',
      available: !!cashappHandle && isMobile,
      deepLink: cashappHandle ? `cashme://${cashappHandle}/${amount}` : undefined
    },
    {
      id: 'zelle',
      name: 'Zelle',
      icon: Zap,
      color: 'bg-purple-500',
      available: !!zelleHandle,
      deepLink: isIOS && zelleHandle ? `zelle://send?recipient=${zelleHandle}&amount=${amount}` : undefined
    }
  ].filter(method => method.available);

  const handleMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method.id);
    setIsProcessing(true);

    if (method.deepLink && isMobile) {
      // Try to open the app
      const link = document.createElement('a');
      link.href = method.deepLink;
      link.click();
      
      // Set up fallback to app store if app doesn't open
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          // App didn't open, show fallback
          const fallbackUrl = method.id === 'venmo' 
            ? 'https://venmo.com/' 
            : method.id === 'cashapp'
            ? 'https://cash.app/'
            : 'https://www.zellepay.com/';
          window.open(fallbackUrl, '_blank');
        }
      }, 1000);
    }

    // Always proceed with payment selection
    setTimeout(() => {
      onPaymentMethodSelected(method.id, amount);
      setIsProcessing(false);
    }, 1500);
  };

  const getMethodDescription = (method: PaymentMethod) => {
    switch (method.id) {
      case 'stripe':
        return 'Secure card payment';
      case 'venmo':
        return `Pay @${venmoHandle}`;
      case 'cashapp':
        return `Pay ${cashappHandle}`;
      case 'zelle':
        return `Send to ${zelleHandle}`;
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Complete Your Tip
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred payment method
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${amount.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tip amount
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMethodSelect(method)}
                  disabled={isProcessing && selectedMethod !== method.id}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4
                    ${selectedMethod === method.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }
                    ${isProcessing && selectedMethod !== method.id ? 'opacity-50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center flex-shrink-0`}>
                    {selectedMethod === method.id && isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <method.icon className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </span>
                      {method.recommended && (
                        <Badge className="text-xs">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getMethodDescription(method)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {selectedMethod === method.id ? (
                      isProcessing ? (
                        <div className="text-green-600 dark:text-green-400 text-sm">
                          Processing...
                        </div>
                      ) : (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )
                    ) : (
                      method.deepLink && (
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      )
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Helper Text */}
            {isMobile && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 Mobile apps will open automatically for faster payment
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}