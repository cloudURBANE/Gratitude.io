export interface UserEntitlements {
  customBranding: boolean;
  advancedAnalytics: boolean;
  multiplePages: boolean;
  prioritySupport: boolean;
  noAds: boolean;
  unlimitedTips: boolean;
}

export async function getUserEntitlements(): Promise<UserEntitlements> {
  try {
    const response = await fetch('/api/entitlements');
    if (!response.ok) {
      throw new Error('Failed to fetch entitlements');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    // Return free tier entitlements as fallback
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