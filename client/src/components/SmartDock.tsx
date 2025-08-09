import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, DollarSign, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  handle?: string;
  description: string;
  primaryColor: string;
  bgColor: string;
}

interface SmartDockProps {
  amount: number;
  profile: any;
  onPaymentInitiated: (method: string) => void;
  className?: string;
}

export function SmartDock({
  amount,
  profile,
  onPaymentInitiated,
  className
}: SmartDockProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect optimal payment method based on device/platform
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'venmo',
      name: 'Venmo',
      icon: <Smartphone size={20} />,
      available: !!profile.venmo_handle,
      handle: profile.venmo_handle,
      description: 'Quick & social',
      primaryColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      icon: <DollarSign size={20} />,
      available: !!profile.cashapp_handle,
      handle: profile.cashapp_handle,
      description: 'Instant transfer',
      primaryColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      id: 'zelle',
      name: 'Zelle',
      icon: <Zap size={20} />,
      available: !!profile.zelle_info,
      handle: profile.zelle_info,
      description: 'Bank to bank',
      primaryColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'stripe',
      name: 'Card',
      icon: <CreditCard size={20} />,
      available: true, // Always available
      description: 'Credit/Debit card',
      primaryColor: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  ];

  const availableMethods = paymentMethods.filter(method => method.available);

  const handlePayment = async (methodId: string) => {
    setSelectedMethod(methodId);
    setIsProcessing(true);

    try {
      if (methodId === 'stripe') {
        // Handle Stripe payment
        const response = await fetch('/api/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: profile.id,
            amount: amount,
            paymentMethod: 'stripe'
          })
        });

        const result = await response.json();
        
        if (result.clientSecret) {
          // Redirect to Stripe Checkout or handle in-app
          console.log('Stripe payment initiated:', result);
        }
      } else {
        // Handle deep link payments (Venmo, CashApp, Zelle)
        const method = availableMethods.find(m => m.id === methodId);
        if (method) {
          let deepLink = '';
          
          switch (methodId) {
            case 'venmo':
              deepLink = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(method.handle!)}&amount=${amount}&note=${encodeURIComponent(`Tip for ${profile.name}`)}`;
              break;
            case 'cashapp':
              deepLink = `https://cash.app/${method.handle}/${amount}`;
              break;
            case 'zelle':
              // Zelle requires app-specific handling
              deepLink = `zelle://send?recipient=${encodeURIComponent(method.handle!)}&amount=${amount}`;
              break;
          }

          if (deepLink) {
            // Try to open the app, fallback to web
            window.location.href = deepLink;
            
            // Track the payment attempt
            await fetch('/api/tips', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileId: profile.id,
                amount: amount,
                paymentMethod: methodId,
                status: 'pending'
              })
            });
          }
        }
      }

      onPaymentInitiated(methodId);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setSelectedMethod(null);
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      <Card className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Choose Payment Method</h3>
          <p className="text-sm text-muted-foreground">
            Select how you'd like to send ${amount.toFixed(2)}
          </p>
        </div>

        <div className="grid gap-3">
          {availableMethods.map((method) => (
            <motion.div key={method.id} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full justify-between h-auto p-4 transition-all",
                  method.bgColor,
                  selectedMethod === method.id && "ring-2 ring-blue-500",
                  isProcessing && selectedMethod !== method.id && "opacity-50"
                )}
                onClick={() => handlePayment(method.id)}
                disabled={isProcessing}
              >
                <div className="flex items-center gap-3">
                  <div className={method.primaryColor}>
                    {method.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                    {method.handle && (
                      <div className="text-xs font-mono text-muted-foreground">
                        {method.handle}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold">${amount.toFixed(2)}</div>
                  {method.id === selectedMethod && isProcessing && (
                    <Badge variant="secondary" className="text-xs">
                      Opening...
                    </Badge>
                  )}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Optimal recommendation */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} className="text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Recommended: {availableMethods[0]?.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              Fastest
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}