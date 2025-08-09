// Deep linking utilities for mobile payment apps

interface PaymentAppLinks {
  venmo: (handle: string, amount: number, note: string) => { deepLink: string; webFallback: string };
  cashapp: (handle: string, amount: number) => { deepLink: string; webFallback: string };
  zelle: (handle: string, amount: number, note: string) => { deepLinks: string[]; fallback: string };
}

export const paymentAppLinks: PaymentAppLinks = {
  venmo: (handle: string, amount: number, note: string) => ({
    deepLink: `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle.replace('@', ''))}&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`,
    webFallback: `https://venmo.com/u/${encodeURIComponent(handle.replace('@', ''))}?amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`
  }),
  
  cashapp: (handle: string, amount: number) => ({
    deepLink: `cashapp://qr/${encodeURIComponent(handle.replace('$', ''))}?amount=${amount.toFixed(2)}`,
    webFallback: `https://cash.app/$${encodeURIComponent(handle.replace('$', ''))}/${amount.toFixed(2)}`
  }),
  
  zelle: (handle: string, amount: number, note: string) => ({
    deepLinks: [`zelle://transfer?recipient=${encodeURIComponent(handle)}&amount=${amount.toFixed(2)}&memo=${encodeURIComponent(note)}`],
    fallback: `Send $${amount.toFixed(2)} to ${handle} using Zelle in your banking app`
  })
};

// Reliable payment app opening based on best practices
export const openPaymentApp = async (
  paymentMethod: 'venmo' | 'cashapp' | 'zelle',
  handle: string,
  amount: number,
  note: string,
  onStatusUpdate: (message: string) => void
): Promise<void> => {
  
  if (paymentMethod === 'venmo') {
    const links = paymentAppLinks.venmo(handle, amount, note);
    
    onStatusUpdate("Opening Venmo...");
    
    // Try app scheme first, then fallback to universal link
    const timeout = setTimeout(() => {
      window.location.href = links.webFallback;
    }, 700);
    
    try {
      window.location.href = links.deepLink;
      // If app opens successfully, page gets backgrounded and timeout won't fire
    } catch (error) {
      clearTimeout(timeout);
      window.location.href = links.webFallback;
    }
    
  } else if (paymentMethod === 'cashapp') {
    const links = paymentAppLinks.cashapp(handle, amount);
    
    onStatusUpdate("Opening Cash App...");
    // Cash App universal link works reliably on both mobile and desktop
    window.location.href = links.deepLink;
    
  } else if (paymentMethod === 'zelle') {
    const links = paymentAppLinks.zelle(handle, amount, note);
    onStatusUpdate(links.fallback);
  }
};

// Helper function to attempt deep link opening with multiple strategies
const attemptDeepLink = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Method 1: Direct window location change (most reliable on mobile)
      const startTime = Date.now();
      
      // Set up visibility change listener to detect if app opened
      const handleVisibilityChange = () => {
        if (document.hidden || Date.now() - startTime > 500) {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(true);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Method 2: Create invisible iframe (works on iOS)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // Method 3: Hidden link with click event
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger click programmatically
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 500);
      
      // Method 4: Try window.location as final attempt
      setTimeout(() => {
        try {
          window.location.href = url;
        } catch (e) {
          console.log('Window.location method failed:', e);
        }
      }, 100);
      
      // Clean up listener after timeout
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        resolve(false);
      }, 3000);
      
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