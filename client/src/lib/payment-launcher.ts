// Comprehensive failproof payment app launching with multiple fallback methods

interface PaymentLaunchOptions {
  method: 'venmo' | 'cashapp' | 'zelle';
  amount: number;
  handle?: string;
  email?: string;
  workerName?: string;
  onStatusUpdate?: (status: string) => void;
  onFallback?: (fallbackUrl: string) => void;
}

export class PaymentLauncher {
  private static instance: PaymentLauncher;
  private attempts: Map<string, number> = new Map();
  
  static getInstance(): PaymentLauncher {
    if (!PaymentLauncher.instance) {
      PaymentLauncher.instance = new PaymentLauncher();
    }
    return PaymentLauncher.instance;
  }

  async launchPaymentApp(options: PaymentLaunchOptions): Promise<boolean> {
    const { method, amount, handle, email, workerName, onStatusUpdate, onFallback } = options;
    const attemptKey = `${method}-${amount}-${handle}`;
    const currentAttempts = this.attempts.get(attemptKey) || 0;
    
    if (currentAttempts >= 3) {
      onStatusUpdate?.('Maximum attempts reached');
      return false;
    }
    
    this.attempts.set(attemptKey, currentAttempts + 1);
    
    onStatusUpdate?.(`Opening ${method}... (Attempt ${currentAttempts + 1})`);
    
    switch (method) {
      case 'venmo':
        return await this.launchVenmo(amount, handle, workerName, onStatusUpdate, onFallback);
      case 'cashapp':
        return await this.launchCashApp(amount, handle, onStatusUpdate, onFallback);
      case 'zelle':
        return await this.launchZelle(amount, handle || email, workerName, onStatusUpdate, onFallback);
      default:
        return false;
    }
  }

  private async launchVenmo(
    amount: number, 
    handle?: string, 
    workerName?: string,
    onStatusUpdate?: (status: string) => void,
    onFallback?: (url: string) => void
  ): Promise<boolean> {
    const note = workerName ? `Tip for ${workerName}` : 'Tip for great service!';
    
    if (!handle) {
      const fallbackUrl = `https://venmo.com/?amount=${amount}`;
      onFallback?.(fallbackUrl);
      return false;
    }

    const cleanHandle = handle.replace('@', '');
    
    // Method 1: Native Venmo deep link
    const deepLink = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(cleanHandle)}&amount=${amount}&note=${encodeURIComponent(note)}`;
    
    if (await this.tryDeepLink(deepLink, 'Venmo app', onStatusUpdate)) {
      return true;
    }

    // Method 2: Universal link for iOS
    const universalLink = `https://venmo.com/u/${encodeURIComponent(cleanHandle)}?amount=${amount}&note=${encodeURIComponent(note)}`;
    
    if (await this.tryWebLink(universalLink, 'Venmo web', onStatusUpdate)) {
      onFallback?.(universalLink);
      return true;
    }

    // Method 3: QR code approach
    const qrLink = `https://venmo.com/qr?user=${encodeURIComponent(cleanHandle)}&amount=${amount}`;
    onFallback?.(qrLink);
    return false;
  }

  private async launchCashApp(
    amount: number, 
    handle?: string,
    onStatusUpdate?: (status: string) => void,
    onFallback?: (url: string) => void
  ): Promise<boolean> {
    if (!handle) {
      const fallbackUrl = 'https://cash.app/';
      onFallback?.(fallbackUrl);
      return false;
    }

    const cleanHandle = handle.replace('$', '');
    
    // Method 1: Cash App universal link (most reliable)
    const universalLink = `https://cash.app/$${encodeURIComponent(cleanHandle)}/${amount}`;
    
    if (await this.tryWebLink(universalLink, 'Cash App', onStatusUpdate)) {
      return true;
    }

    // Method 2: Try deep link scheme
    const deepLink = `cashapp://qr/${encodeURIComponent(cleanHandle)}?amount=${amount}`;
    
    if (await this.tryDeepLink(deepLink, 'Cash App deep link', onStatusUpdate)) {
      return true;
    }

    // Method 3: Web fallback
    const webFallback = `https://cash.app/$${encodeURIComponent(cleanHandle)}`;
    onFallback?.(webFallback);
    return false;
  }

  private async launchZelle(
    amount: number, 
    recipient?: string, 
    workerName?: string,
    onStatusUpdate?: (status: string) => void,
    onFallback?: (url: string) => void
  ): Promise<boolean> {
    if (!recipient) {
      onStatusUpdate?.('No Zelle information available');
      return false;
    }

    const note = workerName ? `Tip for ${workerName}` : 'Tip';
    
    // Method 1: Try Zelle deep link
    const deepLink = `zelle://transfer?recipient=${encodeURIComponent(recipient)}&amount=${amount}&memo=${encodeURIComponent(note)}`;
    
    if (await this.tryDeepLink(deepLink, 'Zelle app', onStatusUpdate)) {
      return true;
    }

    // Method 2: Bank app deep links (try popular banks)
    const bankApps = [
      { scheme: 'com.bankofamerica.BMBMobile', name: 'Bank of America' },
      { scheme: 'com.chase.sig.android', name: 'Chase' },
      { scheme: 'com.wellsfargo.mobile.android.wellsfargomobile', name: 'Wells Fargo' },
      { scheme: 'com.usbank.mobilebanking', name: 'US Bank' }
    ];

    for (const bank of bankApps) {
      const bankLink = `${bank.scheme}://zelle?recipient=${encodeURIComponent(recipient)}&amount=${amount}`;
      if (await this.tryDeepLink(bankLink, bank.name, onStatusUpdate)) {
        return true;
      }
    }

    // Method 3: Web fallback
    onStatusUpdate?.('Please use your banking app to send via Zelle');
    onFallback?.(`Send $${amount} to ${recipient} using Zelle`);
    return false;
  }

  private async tryDeepLink(url: string, appName: string, onStatusUpdate?: (status: string) => void): Promise<boolean> {
    return new Promise((resolve) => {
      onStatusUpdate?.(`Trying ${appName}...`);
      
      let hasReturned = false;
      const startTime = Date.now();
      
      // Method 1: Visibility change detection
      const handleVisibilityChange = () => {
        if (document.hidden && Date.now() - startTime > 100) {
          hasReturned = true;
          cleanup();
          resolve(true);
        }
      };
      
      // Method 2: Blur detection
      const handleBlur = () => {
        if (Date.now() - startTime > 100) {
          hasReturned = true;
          cleanup();
          resolve(true);
        }
      };

      const cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      
      // Try multiple methods simultaneously
      try {
        // Method A: Direct location change
        window.location.href = url;
        
        // Method B: Hidden iframe (iOS compatibility)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 1000);
        
        // Method C: Hidden link click
        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch (e) {}
        }, 500);
        
      } catch (error) {
        console.log('Deep link attempt failed:', error);
      }
      
      // Timeout after 2 seconds
      setTimeout(() => {
        if (!hasReturned) {
          cleanup();
          resolve(false);
        }
      }, 2000);
    });
  }

  private async tryWebLink(url: string, linkName: string, onStatusUpdate?: (status: string) => void): Promise<boolean> {
    return new Promise((resolve) => {
      onStatusUpdate?.(`Opening ${linkName}...`);
      
      try {
        // Open in new tab/window
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        
        if (popup) {
          // Check if popup was blocked
          setTimeout(() => {
            try {
              if (popup.closed) {
                resolve(true);
              } else {
                popup.focus();
                resolve(true);
              }
            } catch (e) {
              resolve(true);
            }
          }, 100);
        } else {
          // Popup blocked, try direct navigation
          window.location.href = url;
          resolve(true);
        }
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Clear attempt history
  clearAttempts(): void {
    this.attempts.clear();
  }
  
  // Get device info for better app detection
  getDeviceInfo(): { platform: string; hasApps: string[] } {
    const ua = navigator.userAgent.toLowerCase();
    const platform = ua.includes('iphone') || ua.includes('ipad') ? 'ios' : 
                    ua.includes('android') ? 'android' : 'web';
    
    // This is a basic detection - in production you might use more sophisticated methods
    const likelyApps = [];
    if (platform === 'ios' || platform === 'android') {
      likelyApps.push('venmo', 'cashapp');
    }
    
    return { platform, hasApps: likelyApps };
  }
}

export default PaymentLauncher;