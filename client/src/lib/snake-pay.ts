export type PayMethod = "cashapp" | "venmo" | "zelle" | "stripe";

export function buildPayUrl(opts: {
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
    // Return Stripe payment intent URL - will be handled by existing flow
    return `/api/create-payment-intent`;
  }
  
  // Zelle requires modal with QR/phone/email
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