/**
 * Device and browser detection utilities for TipVault
 * Optimized for mobile-first experience and payment app integration
 */

export interface DeviceInfo {
  os: 'ios' | 'android' | 'desktop';
  browser: string;
  isInAppBrowser: boolean;
  isMobile: boolean;
  supportsVibration: boolean;
  supportsWakeLock: boolean;
  supportsPaymentRequest: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  viewportSize: {
    width: number;
    height: number;
  };
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const screen = window.screen;
  const viewport = { 
    width: window.innerWidth, 
    height: window.innerHeight 
  };

  // Detect OS
  let os: 'ios' | 'android' | 'desktop' = 'desktop';
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'ios';
  } else if (/Android/i.test(userAgent)) {
    os = 'android';
  }

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'safari';
  } else if (userAgent.includes('Chrome')) {
    browser = 'chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'firefox';
  } else if (userAgent.includes('Edge')) {
    browser = 'edge';
  }

  // Detect in-app browsers
  const inAppBrowserPatterns = [
    /FBAN|FBAV/i, // Facebook
    /Instagram/i, // Instagram
    /Twitter/i, // Twitter
    /Line\//i, // Line
    /MicroMessenger/i, // WeChat
    /KAKAOTALK/i, // KakaoTalk
    /Snapchat/i, // Snapchat
    /TikTok/i, // TikTok
    /LinkedIn/i, // LinkedIn
    /WhatsApp/i, // WhatsApp
  ];

  const isInAppBrowser = inAppBrowserPatterns.some(pattern => 
    pattern.test(userAgent)
  );

  const isMobile = os !== 'desktop' || viewport.width <= 768;

  return {
    os,
    browser,
    isInAppBrowser,
    isMobile,
    supportsVibration: 'vibrate' in navigator,
    supportsWakeLock: 'wakeLock' in navigator,
    supportsPaymentRequest: 'PaymentRequest' in window,
    screenSize: {
      width: screen.width,
      height: screen.height,
    },
    viewportSize: viewport,
  };
}

export function getOptimalPaymentMethods(deviceInfo: DeviceInfo): string[] {
  const methods: string[] = [];

  // Stripe is always available
  methods.push('stripe');

  if (deviceInfo.isMobile && !deviceInfo.isInAppBrowser) {
    if (deviceInfo.os === 'ios') {
      // iOS users prefer Apple Pay, then Venmo, then Cash App
      methods.push('venmo', 'cashapp', 'zelle');
    } else if (deviceInfo.os === 'android') {
      // Android users prefer Google Pay, then Cash App, then Venmo
      methods.push('cashapp', 'venmo', 'zelle');
    }
  } else {
    // Desktop or in-app browser - prioritize web-based methods
    methods.push('zelle', 'venmo', 'cashapp');
  }

  return methods;
}

export function shouldShowBrowserPrompt(deviceInfo: DeviceInfo): boolean {
  return deviceInfo.isInAppBrowser && deviceInfo.isMobile;
}

export function getBrowserPromptText(deviceInfo: DeviceInfo): string {
  const browserName = deviceInfo.os === 'ios' ? 'Safari' : 'Chrome';
  return `For the best payment experience, open this page in ${browserName}`;
}

export function trackDeviceMetrics(profileId: string, sessionId: string) {
  const deviceInfo = getDeviceInfo();
  
  // Track device info for analytics
  fetch('/api/events/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      sessionId,
      eventType: 'device_info',
      eventData: {
        ...deviceInfo,
        timestamp: Date.now(),
      },
    }),
  }).catch(console.error);
}

export function generateDeepLink(
  paymentApp: string,
  handle: string,
  amount: number,
  note?: string
): string | null {
  const encodedNote = encodeURIComponent(note || 'Tip');
  
  switch (paymentApp.toLowerCase()) {
    case 'venmo':
      return `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=${encodedNote}`;
    
    case 'cashapp':
      return `https://cash.app/$${handle}/${amount}`;
    
    case 'zelle':
      // Zelle doesn't have direct deep links, return null to trigger QR modal
      return null;
    
    default:
      return null;
  }
}

export function canUsePaymentMethod(
  method: string,
  deviceInfo: DeviceInfo
): boolean {
  switch (method.toLowerCase()) {
    case 'stripe':
      return true; // Always available
    
    case 'venmo':
    case 'cashapp':
      return deviceInfo.isMobile && !deviceInfo.isInAppBrowser;
    
    case 'zelle':
      return true; // Available via QR code modal
    
    default:
      return false;
  }
}

export function getPaymentMethodPriority(
  method: string,
  deviceInfo: DeviceInfo
): number {
  const basePriorities = {
    stripe: 1,
    venmo: 2,
    cashapp: 3,
    zelle: 4,
  };

  let priority = basePriorities[method as keyof typeof basePriorities] || 10;

  // Adjust based on device
  if (deviceInfo.os === 'android' && method === 'cashapp') {
    priority -= 0.5; // Prefer Cash App on Android
  }
  
  if (deviceInfo.os === 'ios' && method === 'venmo') {
    priority -= 0.5; // Prefer Venmo on iOS
  }

  if (!deviceInfo.isMobile || deviceInfo.isInAppBrowser) {
    priority += 2; // Deprioritize mobile methods on desktop/in-app
  }

  return priority;
}