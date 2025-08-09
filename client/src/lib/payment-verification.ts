/**
 * Payment verification and status tracking for TipVault
 * Handles payment intent monitoring, return detection, and status updates
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: string;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export default class PaymentVerificationManager {
  private checkInterval: number = 2000; // 2 seconds
  private maxChecks: number = 30; // 1 minute total
  private verificationCallbacks: Map<string, (result: PaymentVerificationResult) => void> = new Map();

  /**
   * Start monitoring a payment intent for completion
   */
  async startMonitoring(
    paymentIntentId: string,
    onStatusChange: (result: PaymentVerificationResult) => void
  ): Promise<void> {
    this.verificationCallbacks.set(paymentIntentId, onStatusChange);
    
    let checks = 0;
    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentIntentId}/status`);
        const result: PaymentVerificationResult = await response.json();

        onStatusChange(result);

        // Stop monitoring if payment is complete or failed
        if (result.success || result.status === 'canceled' || checks >= this.maxChecks) {
          this.verificationCallbacks.delete(paymentIntentId);
          return;
        }

        // Continue monitoring
        checks++;
        setTimeout(checkPayment, this.checkInterval);
      } catch (error) {
        console.error('Payment verification error:', error);
        onStatusChange({
          success: false,
          status: 'error',
          error: 'Failed to verify payment status',
        });
        this.verificationCallbacks.delete(paymentIntentId);
      }
    };

    checkPayment();
  }

  /**
   * Stop monitoring a payment intent
   */
  stopMonitoring(paymentIntentId: string): void {
    this.verificationCallbacks.delete(paymentIntentId);
  }

  /**
   * Verify a payment using URL parameters (for return flows)
   */
  async verifyFromURL(): Promise<PaymentVerificationResult | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

    if (!paymentIntentId) {
      return null;
    }

    try {
      const response = await fetch(`/api/payments/${paymentIntentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSecret: paymentIntentClientSecret,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('URL payment verification error:', error);
      return {
        success: false,
        status: 'error',
        error: 'Failed to verify payment',
      };
    }
  }
}

export const paymentVerifier = new PaymentVerificationManager();

/**
 * Local storage utilities for payment tracking
 */
export class PaymentStorage {
  private static readonly STORAGE_KEY = 'tipvault_payments';
  private static readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  static savePayment(payment: {
    id: string;
    profileId: string;
    amount: number;
    method: string;
    timestamp: number;
    status: string;
  }): void {
    try {
      const stored = this.getStoredPayments();
      stored[payment.id] = payment;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save payment to localStorage:', error);
    }
  }

  static getPayment(paymentId: string): any | null {
    try {
      const stored = this.getStoredPayments();
      const payment = stored[paymentId];
      
      if (!payment) return null;
      
      // Check if payment is expired
      if (Date.now() - payment.timestamp > this.MAX_AGE) {
        delete stored[paymentId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
        return null;
      }

      return payment;
    } catch (error) {
      console.error('Failed to get payment from localStorage:', error);
      return null;
    }
  }

  static updatePaymentStatus(paymentId: string, status: string): void {
    try {
      const stored = this.getStoredPayments();
      if (stored[paymentId]) {
        stored[paymentId].status = status;
        stored[paymentId].lastUpdated = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  }

  static getRecentPayments(profileId?: string): any[] {
    try {
      const stored = this.getStoredPayments();
      const payments = Object.values(stored).filter((payment: any) => {
        const isRecent = Date.now() - payment.timestamp <= this.MAX_AGE;
        const matchesProfile = !profileId || payment.profileId === profileId;
        return isRecent && matchesProfile;
      });

      return payments.sort((a: any, b: any) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get recent payments:', error);
      return [];
    }
  }

  static clearExpiredPayments(): void {
    try {
      const stored = this.getStoredPayments();
      const now = Date.now();
      
      Object.keys(stored).forEach(key => {
        if (now - stored[key].timestamp > this.MAX_AGE) {
          delete stored[key];
        }
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to clear expired payments:', error);
    }
  }

  private static getStoredPayments(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored payments:', error);
      return {};
    }
  }
}

/**
 * One-tap repeat functionality
 */
export class OneTapRepeat {
  private static readonly STORAGE_KEY = 'tipvault_preferences';

  static savePreference(profileId: string, preference: {
    amount?: number;
    paymentMethod?: string;
    customerName?: string;
  }): void {
    try {
      const stored = this.getStoredPreferences();
      stored[profileId] = {
        ...preference,
        lastUsed: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to save preference:', error);
    }
  }

  static getPreference(profileId: string): any | null {
    try {
      const stored = this.getStoredPreferences();
      return stored[profileId] || null;
    } catch (error) {
      console.error('Failed to get preference:', error);
      return null;
    }
  }

  static clearPreference(profileId: string): void {
    try {
      const stored = this.getStoredPreferences();
      delete stored[profileId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to clear preference:', error);
    }
  }

  private static getStoredPreferences(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored preferences:', error);
      return {};
    }
  }
}

/**
 * Payment handoff detection
 */
export class PaymentHandoffDetector {
  private static callbacks: Array<() => void> = [];
  private static isListening = false;

  static onReturnFromPayment(callback: () => void): void {
    this.callbacks.push(callback);
    this.startListening();
  }

  static removeCallback(callback: () => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
    
    if (this.callbacks.length === 0) {
      this.stopListening();
    }
  }

  private static startListening(): void {
    if (this.isListening) return;
    
    this.isListening = true;
    
    // Listen for visibility changes (user returning to tab)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Listen for focus events
    window.addEventListener('focus', this.handleWindowFocus);
    
    // Check URL parameters on load
    if (window.location.search.includes('return=true')) {
      setTimeout(() => this.triggerCallbacks(), 100);
    }
  }

  private static stopListening(): void {
    this.isListening = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  private static handleVisibilityChange = (): void => {
    if (!document.hidden) {
      this.triggerCallbacks();
    }
  };

  private static handleWindowFocus = (): void => {
    this.triggerCallbacks();
  };

  private static triggerCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Payment handoff callback error:', error);
      }
    });
  }
}