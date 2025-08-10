// Server-side entitlements system - no client-side trust
export interface UserEntitlements {
  customBranding: boolean;
  advancedAnalytics: boolean;
  multiplePages: boolean;
  prioritySupport: boolean;
  noAds: boolean;
  unlimitedTips: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'pro';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
}

// Server-side entitlements calculation
export function calculateEntitlements(subscription: UserSubscription): UserEntitlements {
  const isPro = subscription.plan === 'pro' && 
    (subscription.status === 'active' || 
     subscription.status === 'trialing' ||
     (subscription.trialEndsAt && new Date() < subscription.trialEndsAt));

  return {
    customBranding: isPro,
    advancedAnalytics: isPro,
    multiplePages: isPro,
    prioritySupport: isPro,
    noAds: isPro,
    unlimitedTips: isPro
  };
}

// Safe ad placement rules
export function shouldShowAds(entitlements: UserEntitlements, placement: string): boolean {
  // No ads for Pro users
  if (entitlements.noAds) return false;
  
  // Only safe placements per feedback
  const allowedPlacements = ['success_partner_ads', 'dashboard_side'];
  return allowedPlacements.includes(placement);
}

// Feature gate check
export function canAccessFeature(entitlements: UserEntitlements, feature: keyof UserEntitlements): boolean {
  return entitlements[feature];
}