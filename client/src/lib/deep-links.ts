// Deep linking utilities for mobile payment apps

interface PaymentAppLinks {
  venmo: (handle: string, amount: number, note: string) => { deepLink: string; webFallback: string };
  cashapp: (handle: string, amount: number) => { deepLink: string; webFallback: string };
  zelle: (handle: string, amount: number, note: string) => { deepLinks: string[]; fallback: string };
}

export const paymentAppLinks: PaymentAppLinks = {
  venmo: (handle: string, amount: number, note: string) => ({
    deepLink: `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=${encodeURIComponent(note)}`,
    webFallback: `https://venmo.com/${handle.replace('@', '')}`
  }),
  
  cashapp: (handle: string, amount: number) => ({
    deepLink: `cashapp://pay/${handle.replace('$', '')}?amount=${amount}`,
    webFallback: `https://cash.app/$${handle.replace('$', '')}/${amount}`
  }),
  
  zelle: (handle: string, amount: number, note: string) => ({
    deepLinks: [
      `zelle://send?recipient=${handle}&amount=${amount}&note=${encodeURIComponent(note)}`,
      `bankofamerica://zelle/send?recipient=${handle}&amount=${amount}`,
      `wellsfargo://zelle/send?recipient=${handle}&amount=${amount}`,
      `chase://pay/zelle?recipient=${handle}&amount=${amount}`,
      `usbank://zelle/send?recipient=${handle}&amount=${amount}`,
      `pnc://zelle/send?recipient=${handle}&amount=${amount}`
    ],
    fallback: `Manual Zelle transfer to ${handle} for $${amount}`
  })
};

// Function to attempt app opening with multiple fallback strategies
export const openPaymentApp = async (
  paymentMethod: 'venmo' | 'cashapp' | 'zelle',
  handle: string,
  amount: number,
  note: string,
  onStatusUpdate: (message: string) => void
): Promise<void> => {
  
  if (paymentMethod === 'venmo') {
    const links = paymentAppLinks.venmo(handle, amount, note);
    
    onStatusUpdate("Opening Venmo app...");
    await attemptDeepLink(links.deepLink);
    
    // Fallback to web after delay
    setTimeout(() => {
      onStatusUpdate("Opening Venmo web version...");
      window.open(links.webFallback, '_blank');
    }, 2000);
    
  } else if (paymentMethod === 'cashapp') {
    const links = paymentAppLinks.cashapp(handle, amount);
    
    onStatusUpdate("Opening Cash App...");
    await attemptDeepLink(links.deepLink);
    
    // Fallback to web after delay
    setTimeout(() => {
      onStatusUpdate("Opening Cash App web version...");
      window.open(links.webFallback, '_blank');
    }, 2000);
    
  } else if (paymentMethod === 'zelle') {
    const links = paymentAppLinks.zelle(handle, amount, note);
    
    onStatusUpdate("Trying to open banking apps...");
    
    // Try each banking app deep link with delays
    for (let i = 0; i < links.deepLinks.length; i++) {
      setTimeout(async () => {
        try {
          await attemptDeepLink(links.deepLinks[i]);
        } catch (error) {
          console.log(`Failed to open banking app ${i + 1}:`, error);
        }
      }, i * 800); // Stagger attempts
    }
    
    // Final fallback message
    setTimeout(() => {
      onStatusUpdate(links.fallback);
    }, links.deepLinks.length * 800 + 1000);
  }
};

// Helper function to attempt deep link opening
const attemptDeepLink = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Method 1: Hidden link click
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Method 2: Try window.location as backup
      setTimeout(() => {
        try {
          window.location.href = url;
        } catch (e) {
          console.log('Window.location method failed:', e);
        }
      }, 500);
      
      resolve(true);
    } catch (error) {
      console.log('Deep link attempt failed:', error);
      resolve(false);
    }
  });
};

// Detect if user is on mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get user's likely banking apps based on common patterns
export const detectLikelyBankingApps = (): string[] => {
  const userAgent = navigator.userAgent.toLowerCase();
  const apps: string[] = [];
  
  // This is a simplified detection - in production you might use more sophisticated methods
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    apps.push('chase', 'bankofamerica', 'wellsfargo', 'usbank', 'pnc');
  } else if (userAgent.includes('android')) {
    apps.push('chase', 'bankofamerica', 'wellsfargo', 'usbank', 'pnc');
  }
  
  return apps;
};