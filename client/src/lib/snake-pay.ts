export type PayMethod = "cashapp" | "venmo" | "zelle" | "stripe";

// Fail-proof app link builder with multiple fallback strategies
export function buildPayUrl(method: PayMethod, amount: number, worker: any): string {
  const formattedAmount = Math.max(0, Number(amount || 0)).toFixed(2);
  
  switch (method) {
    case 'venmo':
      if (worker?.venmoHandle) {
        const handle = worker.venmoHandle.replace(/^@/, '');
        const note = encodeURIComponent(`Tip for ${worker.name || 'great service'}`);
        
        // Try multiple Venmo URL schemes for maximum compatibility
        const venmoUrls = [
          `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle)}&amount=${formattedAmount}&note=${note}`,
          `venmo://payment?recipients=${encodeURIComponent(handle)}&amount=${formattedAmount}&note=${note}`,
          `https://venmo.com/${encodeURIComponent(handle)}?amount=${formattedAmount}&note=${note}`,
          `https://account.venmo.com/u/${encodeURIComponent(handle)}?amount=${formattedAmount}`,
        ];
        
        // Return the first URL, fallbacks handled by PaymentLauncher
        return venmoUrls[0];
      }
      return `https://venmo.com/signup?amount=${formattedAmount}`;
        
    case 'cashapp':
      if (worker?.cashappHandle) {
        const handle = worker.cashappHandle.replace(/^\$/, '');
        return `https://cash.app/$${encodeURIComponent(handle)}/${formattedAmount}`;
      }
      return `https://cash.app/app/SWTMSBR`;
        
    case 'zelle':
      if (worker?.zelleHandle || worker?.zelleEmail) {
        const recipient = worker.zelleHandle || worker.zelleEmail;
        const note = encodeURIComponent(`Tip for ${worker.name || 'service'}`);
        
        // Try Zelle app deep link first, then web fallback
        return `zelle://payment?amount=${formattedAmount}&recipient=${encodeURIComponent(recipient)}&memo=${note}`;
      }
      return `https://www.zellepay.com/get-started`;
        
    case 'stripe':
      return `/u/${worker?.handle || 'demo'}/checkout?amount=${formattedAmount}`;
      
    default:
      return `/u/${worker?.handle || 'demo'}/checkout?amount=${formattedAmount}`;
  }
}

// Keep the original buildPayUrl with options for backwards compatibility
export function buildPayUrlWithOptions(opts: {
  method: PayMethod;
  handles: { cashAppHandle?: string; venmoHandle?: string; zelleHandle?: string; stripeLink?: string };
  amount: number;
  note?: string;
}): string | null {
  const { method, handles, amount, note } = opts;
  const centsFixed = Math.max(0, Number(amount || 0)).toFixed(2).replace(/\.00$/, "");
  
  if (method === "cashapp" && handles.cashAppHandle) {
    const tag = handles.cashAppHandle.replace(/^\$/, "");
    return `https://cash.app/$${encodeURIComponent(tag)}/${centsFixed}`;
  }
  
  if (method === "venmo" && handles.venmoHandle) {
    const u = handles.venmoHandle.replace(/^@/, "");
    const params = new URLSearchParams({
      txn: "pay",
      amount: String(amount),
      note: note || ""
    });
    return `https://venmo.com/${encodeURIComponent(u)}?${params.toString()}`;
  }
  
  if (method === "stripe") {
    return `/api/create-payment-intent`;
  }
  
  return null;
}

// Platform hint for default ordering
export function defaultPayMethod(): PayMethod {
  if (typeof navigator === "undefined") return "venmo";
  
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "cashapp";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("mac os")) return "stripe";
  return "venmo";
}