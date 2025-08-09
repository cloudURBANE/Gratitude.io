export type PayMethod = "cashapp" | "venmo" | "zelle" | "stripe";

// Updated buildPayUrl function compatible with existing tip-flow.tsx
export function buildPayUrl(method: PayMethod, amount: number, worker: any): string {
  switch (method) {
    case 'venmo':
      if (worker?.venmoHandle) {
        const handle = worker.venmoHandle.replace(/^@/, '');
        return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle)}&amount=${amount}&note=${encodeURIComponent('Tip for great service!')}`;
      }
      return `https://venmo.com/?amount=${amount}`;
        
    case 'cashapp':
      if (worker?.cashappHandle) {
        const handle = worker.cashappHandle.replace(/^\$/, '');
        return `https://cash.app/$${encodeURIComponent(handle)}/${amount}`;
      }
      return `https://cash.app/`;
        
    case 'zelle':
      if (worker?.zelleHandle || worker?.zelleEmail) {
        const recipient = worker.zelleHandle || worker.zelleEmail;
        return `zelle://payment?amount=${amount}&recipient=${encodeURIComponent(recipient)}&note=${encodeURIComponent(`Tip for ${worker.name}`)}`;
      }
      return `https://www.zellepay.com/`;
        
    case 'stripe':
      return '/checkout';
      
    default:
      return '/checkout';
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