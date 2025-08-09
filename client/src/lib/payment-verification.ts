// Payment verification and validation logic

export interface PaymentVerification {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  amount: number;
  method: string;
  timestamp: number;
  verificationCode?: string;
  errorMessage?: string;
}

export class PaymentVerificationManager {
  private static instance: PaymentVerificationManager;
  private verificationCallbacks: Map<string, (verification: PaymentVerification) => void> = new Map();
  private pendingVerifications: Map<string, PaymentVerification> = new Map();
  
  static getInstance(): PaymentVerificationManager {
    if (!PaymentVerificationManager.instance) {
      PaymentVerificationManager.instance = new PaymentVerificationManager();
    }
    return PaymentVerificationManager.instance;
  }

  // Start verification process for a payment intent
  async startVerification(paymentId: string, amount: number, method: string): Promise<PaymentVerification> {
    const verification: PaymentVerification = {
      status: 'pending',
      amount,
      method,
      timestamp: Date.now(),
      verificationCode: this.generateVerificationCode()
    };

    this.pendingVerifications.set(paymentId, verification);
    
    // Set expiration timeout (10 minutes)
    setTimeout(() => {
      const current = this.pendingVerifications.get(paymentId);
      if (current && current.status === 'pending') {
        this.updateVerificationStatus(paymentId, 'expired', 'Verification expired');
      }
    }, 10 * 60 * 1000);

    return verification;
  }

  // Update verification status
  updateVerificationStatus(paymentId: string, status: PaymentVerification['status'], errorMessage?: string): void {
    const verification = this.pendingVerifications.get(paymentId);
    if (verification) {
      verification.status = status;
      verification.timestamp = Date.now();
      if (errorMessage) {
        verification.errorMessage = errorMessage;
      }
      
      // Notify callback
      const callback = this.verificationCallbacks.get(paymentId);
      if (callback) {
        callback(verification);
      }
    }
  }

  // Register callback for verification updates
  onVerificationUpdate(paymentId: string, callback: (verification: PaymentVerification) => void): void {
    this.verificationCallbacks.set(paymentId, callback);
  }

  // Remove verification tracking
  clearVerification(paymentId: string): void {
    this.pendingVerifications.delete(paymentId);
    this.verificationCallbacks.delete(paymentId);
  }

  // Get current verification status
  getVerificationStatus(paymentId: string): PaymentVerification | null {
    return this.pendingVerifications.get(paymentId) || null;
  }

  // Verify payment completion through multiple methods
  async verifyPaymentCompletion(paymentId: string): Promise<boolean> {
    const verification = this.pendingVerifications.get(paymentId);
    if (!verification) return false;

    // Method 1: Check with backend
    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          this.updateVerificationStatus(paymentId, 'completed');
          return true;
        }
      }
    } catch (error) {
      console.warn('Backend verification failed:', error);
    }

    // Method 2: Check localStorage for payment completion markers
    try {
      const completionMarker = localStorage.getItem(`payment-complete-${paymentId}`);
      if (completionMarker) {
        const data = JSON.parse(completionMarker);
        if (Date.now() - data.timestamp < 15 * 60 * 1000) { // 15 minutes validity
          this.updateVerificationStatus(paymentId, 'completed');
          localStorage.removeItem(`payment-complete-${paymentId}`);
          return true;
        }
      }
    } catch (error) {
      console.warn('localStorage verification failed:', error);
    }

    // Method 3: Manual verification for external apps
    if (verification.method !== 'stripe') {
      // For external payment apps, we can't verify automatically
      // The user needs to confirm or we detect return behavior
      return await this.waitForUserReturn(paymentId);
    }

    return false;
  }

  // Wait for user to return from external payment app
  private async waitForUserReturn(paymentId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const verification = this.pendingVerifications.get(paymentId);
      if (!verification) {
        resolve(false);
        return;
      }

      // Listen for visibility change (user returning to app)
      const handleVisibilityChange = () => {
        if (!document.hidden && verification.status === 'pending') {
          // User returned, update to processing and wait for confirmation
          this.updateVerificationStatus(paymentId, 'processing');
          
          // Auto-resolve after reasonable time if no explicit failure
          setTimeout(() => {
            const current = this.pendingVerifications.get(paymentId);
            if (current && current.status === 'processing') {
              this.updateVerificationStatus(paymentId, 'completed');
              resolve(true);
            }
          }, 3000);
        }
      };

      // Listen for storage events (cross-tab communication)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `payment-complete-${paymentId}`) {
          this.updateVerificationStatus(paymentId, 'completed');
          cleanup();
          resolve(true);
        }
      };

      const cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('storage', handleStorageChange);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('storage', handleStorageChange);

      // Timeout after 10 minutes
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 10 * 60 * 1000);
    });
  }

  // Generate verification code for manual confirmation
  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Validate payment amount and details
  validatePaymentDetails(amount: number, method: string, workerData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate amount
    if (!amount || amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    if (amount > 1000) {
      errors.push('Amount exceeds maximum limit of $1000');
    }

    // Validate method
    const validMethods = ['stripe', 'venmo', 'cashapp', 'zelle'];
    if (!validMethods.includes(method)) {
      errors.push('Invalid payment method');
    }

    // Validate worker has required handles for method
    if (method === 'venmo' && !workerData?.venmoHandle) {
      errors.push('Venmo handle not available for this worker');
    }
    if (method === 'cashapp' && !workerData?.cashappHandle) {
      errors.push('Cash App handle not available for this worker');
    }
    if (method === 'zelle' && !workerData?.zelleHandle && !workerData?.zelleEmail) {
      errors.push('Zelle information not available for this worker');
    }

    return { valid: errors.length === 0, errors };
  }

  // Mark payment as manually verified (for testing/admin)
  markAsVerified(paymentId: string): void {
    try {
      localStorage.setItem(`payment-complete-${paymentId}`, JSON.stringify({
        timestamp: Date.now(),
        manual: true
      }));
      this.updateVerificationStatus(paymentId, 'completed');
    } catch (error) {
      console.warn('Failed to mark payment as verified:', error);
    }
  }
}

export default PaymentVerificationManager;