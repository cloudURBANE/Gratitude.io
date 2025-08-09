// Enhanced payment launcher with fail-proof app linking
export type PaymentMethod = "venmo" | "cashapp" | "zelle" | "stripe";

interface PaymentLaunchOptions {
  method: PaymentMethod;
  amount: number;
  worker: any;
  onFallback?: () => void;
  onSuccess?: () => void;
}

export class PaymentLauncher {
  private static visibilityCheckTimeout: NodeJS.Timeout | null = null;

  static async launch({ method, amount, worker, onFallback, onSuccess }: PaymentLaunchOptions) {
    const formattedAmount = Math.max(0, Number(amount || 0)).toFixed(2);
    
    // Store payment attempt for return detection
    const paymentIntent = {
      method,
      amount: formattedAmount,
      worker: worker?.handle || 'demo',
      timestamp: Date.now(),
      step: 'redirecting'
    };
    localStorage.setItem('tiplink-payment-intent', JSON.stringify(paymentIntent));

    try {
      if (method === 'venmo') {
        await this.launchVenmo(formattedAmount, worker, onFallback, onSuccess);
      } else if (method === 'cashapp') {
        await this.launchCashApp(formattedAmount, worker, onFallback, onSuccess);
      } else if (method === 'zelle') {
        await this.launchZelle(formattedAmount, worker, onFallback, onSuccess);
      } else {
        // Stripe fallback
        window.location.href = `/u/${worker?.handle || 'demo'}/checkout?amount=${formattedAmount}`;
        onSuccess?.();
      }
    } catch (error) {
      console.warn('Payment launch failed:', error);
      onFallback?.();
    }
  }

  private static async launchVenmo(amount: string, worker: any, onFallback?: () => void, onSuccess?: () => void) {
    if (!worker?.venmoHandle) {
      this.fallbackToWebsite('venmo', amount);
      onFallback?.();
      return;
    }

    const handle = worker.venmoHandle.replace(/^@/, '');
    const note = encodeURIComponent(`Tip for ${worker.name || 'great service'}`);
    
    // Try multiple Venmo schemes in order of likelihood to work
    const venmoUrls = [
      `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle)}&amount=${amount}&note=${note}`,
      `venmo://payment?recipients=${encodeURIComponent(handle)}&amount=${amount}&note=${note}`,
      `https://venmo.com/${encodeURIComponent(handle)}?amount=${amount}&note=${note}`,
      `https://account.venmo.com/u/${encodeURIComponent(handle)}?amount=${amount}`,
    ];

    for (let i = 0; i < venmoUrls.length; i++) {
      const success = await this.attemptAppLaunch(venmoUrls[i], 3000);
      if (success) {
        onSuccess?.();
        return;
      }
      
      // If deep link failed, try web version
      if (i === 0) {
        continue;
      }
    }
    
    // All attempts failed, fallback
    this.fallbackToWebsite('venmo', amount);
    onFallback?.();
  }

  private static async launchCashApp(amount: string, worker: any, onFallback?: () => void, onSuccess?: () => void) {
    if (!worker?.cashappHandle) {
      this.fallbackToWebsite('cashapp', amount);
      onFallback?.();
      return;
    }

    const handle = worker.cashappHandle.replace(/^\$/, '');
    const cashAppUrl = `https://cash.app/$${encodeURIComponent(handle)}/${amount}`;
    
    const success = await this.attemptAppLaunch(cashAppUrl, 3000);
    if (success) {
      onSuccess?.();
    } else {
      this.fallbackToWebsite('cashapp', amount);
      onFallback?.();
    }
  }

  private static async launchZelle(amount: string, worker: any, onFallback?: () => void, onSuccess?: () => void) {
    const recipient = worker?.zelleHandle || worker?.zelleEmail;
    if (!recipient) {
      this.fallbackToWebsite('zelle', amount);
      onFallback?.();
      return;
    }

    const note = encodeURIComponent(`Tip for ${worker.name || 'service'}`);
    const zelleUrls = [
      `zelle://payment?amount=${amount}&recipient=${encodeURIComponent(recipient)}&memo=${note}`,
      `https://www.zellepay.com/send-money?amount=${amount}&recipient=${encodeURIComponent(recipient)}`,
    ];

    for (const url of zelleUrls) {
      const success = await this.attemptAppLaunch(url, 3000);
      if (success) {
        onSuccess?.();
        return;
      }
    }
    
    this.fallbackToWebsite('zelle', amount);
    onFallback?.();
  }

  private static async attemptAppLaunch(url: string, timeout: number = 3000): Promise<boolean> {
    return new Promise((resolve) => {
      let launched = false;
      
      // Track visibility changes to detect app launch
      const handleVisibilityChange = () => {
        if (document.hidden && !launched) {
          launched = true;
          resolve(true);
          cleanup();
        }
      };

      // Track focus loss (another indicator of app launch)
      const handleBlur = () => {
        if (!launched) {
          launched = true;
          resolve(true);
          cleanup();
        }
      };

      const cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        if (this.visibilityCheckTimeout) {
          clearTimeout(this.visibilityCheckTimeout);
          this.visibilityCheckTimeout = null;
        }
      };

      // Set up listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);

      // Launch the app
      try {
        if (url.startsWith('http')) {
          window.location.href = url;
        } else {
          // For deep links, try iframe method first, then direct location
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          document.body.appendChild(iframe);
          
          // Fallback to direct location change
          setTimeout(() => {
            if (!launched) {
              window.location.href = url;
            }
          }, 500);
          
          // Clean up iframe
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      } catch (e) {
        console.warn('App launch attempt failed:', e);
      }

      // Timeout fallback
      this.visibilityCheckTimeout = setTimeout(() => {
        if (!launched) {
          resolve(false);
          cleanup();
        }
      }, timeout);
    });
  }

  private static fallbackToWebsite(method: PaymentMethod, amount: string) {
    const fallbackUrls = {
      venmo: `https://venmo.com/signup?amount=${amount}`,
      cashapp: `https://cash.app/app/SWTMSBR`,
      zelle: `https://www.zellepay.com/get-started`,
      stripe: `/checkout?amount=${amount}`
    };
    
    window.location.href = fallbackUrls[method];
  }

  // Check if user returned from payment app
  static checkPaymentReturn(worker: any, onReturn: (amount: string, method: PaymentMethod) => void) {
    try {
      const paymentIntent = localStorage.getItem('tiplink-payment-intent');
      if (paymentIntent) {
        const intent = JSON.parse(paymentIntent);
        const timeSincePayment = Date.now() - intent.timestamp;
        
        // If user returns within 10 minutes and payment is for current worker
        if (timeSincePayment < 600000 && intent.step === 'redirecting' && 
            intent.worker === (worker?.handle || 'demo')) {
          
          // Mark as completed
          intent.step = 'completed';
          localStorage.setItem('tiplink-payment-intent', JSON.stringify(intent));
          
          onReturn(intent.amount, intent.method);
        }
      }
    } catch (e) {
      console.warn('Failed to check payment return:', e);
    }
  }
}

export default PaymentLauncher;