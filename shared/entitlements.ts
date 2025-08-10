export interface Entitlements {
  customBranding: boolean;
  advancedAnalytics: boolean;
  multiplePages: boolean;
  prioritySupport: boolean;
  noAds: boolean;
  unlimitedTips: boolean;
}

export interface UserPlan {
  id: string;
  plan: 'free' | 'pro';
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
}

export function getEntitlements(userPlan: UserPlan): Entitlements {
  const isPro = userPlan.plan === 'pro' && 
    (userPlan.subscriptionStatus === 'active' || 
     (userPlan.trialEndsAt && new Date() < userPlan.trialEndsAt));

  return {
    customBranding: isPro,
    advancedAnalytics: isPro,
    multiplePages: isPro,
    prioritySupport: isPro,
    noAds: isPro,
    unlimitedTips: isPro
  };
}

export function shouldShowAds(userPlan: UserPlan): boolean {
  const entitlements = getEntitlements(userPlan);
  return !entitlements.noAds;
}