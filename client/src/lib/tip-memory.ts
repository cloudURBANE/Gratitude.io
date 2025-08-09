// TipLink Express - Smart memory and defaults system

export interface TipMemory {
  amount: number;
  method: 'venmo' | 'cashapp' | 'zelle' | 'stripe';
  timestamp: number;
}

export interface SmartDefaults {
  amount: number;
  method: 'venmo' | 'cashapp' | 'zelle' | 'stripe';
}

// One-Tap Repeat (remembers the customer)
export class TipMemoryManager {
  private getStorageKey(handle: string): string {
    return `tiplink:${handle}:last`;
  }

  saveLastTip(handle: string, amount: number, method: string): void {
    const memory: TipMemory = {
      amount,
      method: method as TipMemory['method'],
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.getStorageKey(handle), JSON.stringify(memory));
    } catch (error) {
      console.warn('Failed to save tip memory:', error);
    }
  }

  getLastTip(handle: string): TipMemory | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(handle));
      if (!stored) return null;
      
      const memory: TipMemory = JSON.parse(stored);
      
      // Only return if it's within the last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (memory.timestamp < thirtyDaysAgo) {
        this.clearLastTip(handle);
        return null;
      }
      
      return memory;
    } catch (error) {
      console.warn('Failed to get tip memory:', error);
      return null;
    }
  }

  clearLastTip(handle: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(handle));
    } catch (error) {
      console.warn('Failed to clear tip memory:', error);
    }
  }
}

// Smart Default (context-aware)
export class SmartDefaultsManager {
  getSmartDefaults(): SmartDefaults {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    const isEvening = hour >= 17; // 5 PM or later
    const isMorning = hour >= 6 && hour < 12;

    // Context-aware amount defaults
    let amount = 8; // Base default
    
    if (isMorning && !isWeekend) {
      amount = 5; // Weekday morning
    } else if (isEvening && isWeekend) {
      amount = 12; // Weekend evening
    } else if (isWeekend) {
      amount = 10; // Weekend default
    }

    // Device-aware method defaults
    let method: SmartDefaults['method'] = 'stripe';
    
    if (this.isIOS()) {
      method = 'stripe'; // Apple Pay integration
    } else if (this.isAndroid()) {
      method = 'cashapp'; // Popular on Android
    }

    return { amount, method };
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  private isMobile(): boolean {
    return this.isIOS() || this.isAndroid();
  }
}

// Return-Flow Reviews (detect when user comes back from payment app)
export class ReturnFlowManager {
  private callbacks: (() => void)[] = [];
  private hasBeenHidden = false;

  constructor() {
    this.setupVisibilityListener();
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.hasBeenHidden = true;
      } else if (document.visibilityState === 'visible' && this.hasBeenHidden) {
        // User returned from payment app
        this.triggerReturnCallbacks();
        this.hasBeenHidden = false;
      }
    });
  }

  onReturn(callback: () => void): void {
    this.callbacks.push(callback);
  }

  private triggerReturnCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Return flow callback error:', error);
      }
    });
  }

  destroy(): void {
    this.callbacks = [];
  }
}

// URL parameter parsing for smart defaults
export function parseSmartParams(): { amount?: number; method?: string } {
  const url = new URL(window.location.href);
  const amount = url.searchParams.get('a');
  const method = url.searchParams.get('m');
  
  return {
    amount: amount ? parseFloat(amount) : undefined,
    method: method || undefined
  };
}

// Generate short links for NFC/QR with smart defaults
export function generateShortLink(handle: string, amount: number, method: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/u/${handle}?a=${amount}&m=${method}`;
}

// Whisper Boost - optional $1 add-on
export interface WhisperBoostConfig {
  enabled: boolean;
  amount: number;
  message: string;
}

export function getWhisperBoostConfig(): WhisperBoostConfig {
  return {
    enabled: true,
    amount: 1,
    message: "+ $1 keeps this worker ad-free"
  };
}