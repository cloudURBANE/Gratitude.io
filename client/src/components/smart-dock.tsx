import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SmartDockProps {
  amount: number;
  worker: any;
  onPaymentMethodSelect: (method: string) => void;
  className?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  priority: number;
  available: boolean;
}

export default function SmartDock({ 
  amount, 
  worker, 
  onPaymentMethodSelect, 
  className = "" 
}: SmartDockProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [haloColor, setHaloColor] = useState<string>('rgba(139, 69, 255, 0.3)');

  // Detect platform and in-app browsers
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOSInApp = /Instagram|FBAN|FBAV|FBDV/.test(ua) && /iPhone|iPad/.test(ua);
    const isAndroidInApp = /Instagram|FBAN|FBAV|FBDV|wv/.test(ua) && /Android/.test(ua);
    setIsInAppBrowser(isIOSInApp || isAndroidInApp);
  }, []);

  // Get smart ordered payment methods
  const getPaymentMethods = (): PaymentMethod[] => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad/.test(ua);
    const isAndroid = /Android/.test(ua);
    
    const methods: PaymentMethod[] = [
      {
        id: 'stripe',
        name: isIOS ? 'Apple Pay' : 'Card',
        icon: isIOS ? '📱' : '💳',
        priority: isIOS ? 1 : 3,
        available: true
      },
      {
        id: 'cashapp',
        name: 'Cash App',
        icon: '💵',
        priority: isAndroid ? 1 : 2,
        available: true
      },
      {
        id: 'venmo',
        name: 'Venmo',
        icon: '💜',
        priority: 2,
        available: true
      },
      {
        id: 'zelle',
        name: 'Zelle',
        icon: '🏦',
        priority: 4,
        available: !!worker?.zelleEmail || !!worker?.zellePhone
      }
    ];

    return methods
      .filter(m => m.available)
      .sort((a, b) => a.priority - b.priority);
  };

  const paymentMethods = getPaymentMethods();
  const primaryMethods = paymentMethods.slice(0, 3);
  const secondaryMethods = paymentMethods.slice(3);

  // Handle method selection with visual feedback
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method.id);
    
    // Set halo color based on payment method
    const colors = {
      stripe: 'rgba(0, 123, 255, 0.4)',
      cashapp: 'rgba(0, 209, 178, 0.4)', 
      venmo: 'rgba(60, 90, 153, 0.4)',
      zelle: 'rgba(112, 39, 195, 0.4)'
    };
    
    setHaloColor(colors[method.id as keyof typeof colors] || 'rgba(139, 69, 255, 0.3)');
    
    setTimeout(() => {
      setHaloColor('rgba(139, 69, 255, 0.3)');
      onPaymentMethodSelect(method.id);
    }, 200);
  };

  // Copy link to clipboard for in-app browsers
  const copyDeepLink = async (method: PaymentMethod) => {
    const urls = {
      cashapp: `https://cash.app/$${worker?.cashAppHandle}/${amount}`,
      venmo: `https://venmo.com/u/${worker?.venmoHandle}?amount=${amount}`,
      zelle: `zelle://payment?amount=${amount}&note=Tip%20for%20${encodeURIComponent(worker?.name)}`,
    };
    
    const url = urls[method.id as keyof typeof urls];
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        // Announce for accessibility
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Link copied to clipboard';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      } catch (err) {
        console.warn('Failed to copy link:', err);
      }
    }
  };

  if (amount <= 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Payment-aware halo */}
      <motion.div
        className="absolute -inset-4 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${haloColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative bg-glass backdrop-blur-md border border-glass-border rounded-2xl p-4">
        {/* In-app browser guard */}
        {isInAppBrowser && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-center">
            <p className="text-sm text-text-primary font-medium mb-2">
              Open in {/iPhone|iPad/.test(navigator.userAgent) ? 'Safari' : 'Chrome'} for best experience
            </p>
            <button
              className="text-xs text-accent-start hover:text-accent-end underline"
              onClick={() => copyDeepLink(primaryMethods[0])}
            >
              Tap to copy payment link
            </button>
          </div>
        )}

        {/* Primary payment methods */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {primaryMethods.map((method, index) => (
            <motion.button
              key={method.id}
              className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-glass hover:bg-glass-border border border-glass-border transition-all duration-200"
              onClick={() => handleMethodSelect(method)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ minHeight: '80px' }}
            >
              {/* Quick sheen effect on press */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: selectedMethod === method.id ? [0, 1, 0] : 0,
                  x: selectedMethod === method.id ? [-20, 20, 40] : -20
                }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="text-2xl">{method.icon}</div>
              <span className="text-sm font-medium text-text-primary">
                {method.name}
              </span>
              
              {/* Best choice indicator */}
              {index === 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-start rounded-full border-2 border-background" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Secondary methods toggle */}
        {secondaryMethods.length > 0 && (
          <div>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setShowSecondary(!showSecondary)}
            >
              <span>Other methods</span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showSecondary ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: showSecondary ? 'auto' : 0, 
                opacity: showSecondary ? 1 : 0 
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-glass-border">
                {secondaryMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    className="flex items-center gap-2 p-3 rounded-lg bg-glass hover:bg-glass-border border border-glass-border transition-all duration-200"
                    onClick={() => handleMethodSelect(method)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {method.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}