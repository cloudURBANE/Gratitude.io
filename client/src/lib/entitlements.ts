// Server-side entitlements checking - no client-side trust
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
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

// This would be called from server-side API
export async function getUserEntitlements(): Promise<UserEntitlements> {
  try {
    const response = await fetch('/api/user/entitlements');
    if (!response.ok) {
      throw new Error('Failed to fetch entitlements');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    // Default to free tier if error
    return {
      customBranding: false,
      advancedAnalytics: false,
      multiplePages: false,
      prioritySupport: false,
      noAds: false,
      unlimitedTips: false
    };
  }
}

export function shouldShowAds(entitlements: UserEntitlements): boolean {
  return !entitlements.noAds;
}

export function canAccessFeature(entitlements: UserEntitlements, feature: keyof UserEntitlements): boolean {
  return entitlements[feature];
}