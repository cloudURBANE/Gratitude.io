import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Star, DollarSign, TrendingUp } from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';

interface AdSlotProps {
  placement: 'success_page' | 'dashboard_side';
  className?: string;
}

export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { shouldShowAds } = useEntitlements();

  if (!shouldShowAds || isDismissed) {
    return null;
  }

  // Only show ads on allowed placements
  if (!['success_page', 'dashboard_side'].includes(placement)) {
    return null;
  }

  const getAdContent = () => {
    if (placement === 'success_page') {
      return {
        title: 'Partner Recommendations',
        subtitle: 'Tools to help grow your tips',
        ads: [
          {
            id: 'tiptracker',
            title: 'TipTracker Pro',
            description: 'Advanced analytics and earning insights for service workers',
            cta: 'Get Free Trial',
            badge: 'Popular',
            icon: TrendingUp
          },
          {
            id: 'earnmore',
            title: 'EarnMore Academy',
            description: 'Learn proven strategies to increase your tips by 40%',
            cta: 'Start Learning',
            badge: 'New',
            icon: Star
          }
        ]
      };
    }

    // dashboard_side placement
    return {
      title: 'Partner Tools',
      subtitle: 'Boost your earnings',
      ads: [
        {
          id: 'quickbooks',
          title: 'QuickBooks Simple Start',
          description: 'Track your tip income for taxes. Free for 3 months.',
          cta: 'Get Started',
          badge: 'Free Trial',
          icon: DollarSign
        }
      ]
    };
  };

  const content = getAdContent();

  const handleAdClick = (adId: string) => {
    // Track ad click for analytics
    console.log(`Ad clicked: ${adId}`);
    // In production, this would make an API call to track the click
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 relative">
        {/* Dismissible */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label="Dismiss recommendations"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {content.title}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              {content.subtitle}
            </p>
          </div>

          {/* Ads */}
          <div className="space-y-3">
            {content.ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ad.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {ad.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {ad.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => handleAdClick(ad.id)}
                >
                  {ad.cta}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Partner recommendations • Dismissible
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export default AdSlot;