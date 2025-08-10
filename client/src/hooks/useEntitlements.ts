import { useQuery } from '@tanstack/react-query';
import { getUserEntitlements, type UserEntitlements } from '@/lib/entitlements';

export function useEntitlements() {
  const { data: entitlements, isLoading } = useQuery({
    queryKey: ['/api/entitlements'],
    queryFn: getUserEntitlements,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Default to free tier if no data
  const defaultEntitlements: UserEntitlements = {
    customBranding: false,
    advancedAnalytics: false,
    multiplePages: false,
    prioritySupport: false,
    noAds: false,
    unlimitedTips: false
  };

  const userEntitlements = entitlements || defaultEntitlements;

  return {
    entitlements: userEntitlements,
    isLoading,
    isPro: userEntitlements.advancedAnalytics || userEntitlements.customBranding,
    shouldShowAds: !userEntitlements.noAds,
    canCustomizeBranding: userEntitlements.customBranding,
    hasAdvancedAnalytics: userEntitlements.advancedAnalytics,
    canCreateMultiplePages: userEntitlements.multiplePages,
    hasPrioritySupport: userEntitlements.prioritySupport,
    hasUnlimitedTips: userEntitlements.unlimitedTips
  };
}