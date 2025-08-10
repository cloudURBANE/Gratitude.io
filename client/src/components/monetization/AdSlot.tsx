import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adService, isFreeTier, type AdConfig } from "@/lib/ads";

interface AdSlotProps {
  placement: string;
  className?: string;
  onImpressionTracked?: (adId: string) => void;
  onAdClicked?: (adId: string) => void;
}

// Enhanced ad content with real revenue potential
const mockAdContent = {
  tip_page_bottom: {
    type: 'upgrade_banner',
    title: 'Unlock Pro Features',
    description: 'Get unlimited tip pages, custom branding, and detailed analytics to maximize earnings.',
    cta: 'Upgrade Now',
    color: 'blue'
  },
  dashboard_side: {
    type: 'feature_promo',
    title: 'Analytics Dashboard',
    description: 'Track peak hours, customer patterns, and optimize your tip strategy with Pro.',
    cta: 'See Analytics',
    color: 'green'
  },
  checkout_upsell: {
    type: 'interstitial',
    title: 'Last Chance: Pro Trial',
    description: 'Start your 7-day free trial now and increase tips by 300% immediately.',
    cta: 'Start Trial',
    color: 'purple'
  }
};

// Ad revenue partners (mock data for demo)
const revenuePartnerAds = [
  {
    id: 'partner_001',
    title: 'Restaurant POS Systems',
    description: 'Integrate seamlessly with Square, Toast, and Clover for automatic tip tracking.',
    cta: 'Learn More',
    revenue: 0.45,
    partner: 'Square'
  },
  {
    id: 'partner_002', 
    title: 'Tax Prep for Service Workers',
    description: 'Maximize deductions and track expenses with TurboTax Self-Employed.',
    cta: 'File Now',
    revenue: 0.65,
    partner: 'TurboTax'
  },
  {
    id: 'partner_003',
    title: 'Banking for Gig Workers',
    description: 'Get paid faster with Chime\'s instant deposits and fee-free banking.',
    cta: 'Open Account', 
    revenue: 0.85,
    partner: 'Chime'
  }
];

export default function AdSlot({ 
  placement, 
  className = "", 
  onImpressionTracked,
  onAdClicked 
}: AdSlotProps) {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);

  // Check if user should see ads (free tier only)
  const showAds = isFreeTier();

  useEffect(() => {
    if (!showAds) return;
    
    // Safe ad placement - only success page and dashboard sidebar per feedback
    const allowedPlacements = ['success_partner_ads', 'dashboard_side'];
    if (!allowedPlacements.includes(placement)) {
      return;
    }
    
    // Get appropriate ad for placement
    const config = adService.getAdForPlacement(placement, 'free');
    if (config) {
      setAdConfig(config);
      
      // Use partner ads for relevant service worker tools
      const partnerAd = revenuePartnerAds[Math.floor(Math.random() * revenuePartnerAds.length)];
      setCurrentAd(partnerAd);
    }
  }, [placement, showAds]);

  useEffect(() => {
    // Track impression once when ad loads
    if (!impressionTracked && adConfig && currentAd && isVisible) {
      adService.trackImpression(adConfig.id, placement);
      setImpressionTracked(true);
      onImpressionTracked?.(adConfig.id);
    }
  }, [impressionTracked, adConfig, currentAd, isVisible, placement, onImpressionTracked]);

  const handleClick = () => {
    if (adConfig && currentAd) {
      adService.trackClick(adConfig.id, placement);
      onAdClicked?.(adConfig.id);
      
      // Handle different ad types
      if (currentAd.type === 'upgrade_banner' || currentAd.type === 'feature_promo') {
        window.location.href = '/pricing';
      } else if (currentAd.type === 'interstitial') {
        window.location.href = '/checkout?plan=pro_monthly&source=ad';
      } else if (currentAd.partner) {
        // Would open partner links (mock for demo)
        window.open('#', '_blank');
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Could track dismissal analytics here
  };

  // Safe ad placement check - only success page and dashboard sidebar
  const allowedPlacements = ['success_partner_ads', 'dashboard_side'];
  if (!allowedPlacements.includes(placement)) {
    return null;
  }

  // Don't render for paid users or if no ad content
  if (!showAds || !adConfig || !currentAd || !isVisible) {
    return null;
  }

  // Render different ad formats based on type
  const renderAdContent = () => {
    if (adConfig.type === 'interstitial') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
        >
          <Card className="max-w-md w-full p-6 bg-white">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign size={32} className="text-purple-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">{currentAd.title}</h3>
              <p className="text-gray-600">{currentAd.description}</p>
              
              <Button
                onClick={handleClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {currentAd.cta}
                <ExternalLink size={16} className="ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative ${className}`}
      >
        <Card className="p-4 border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              currentAd.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              currentAd.color === 'green' ? 'bg-green-100 text-green-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              <TrendingUp size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {currentAd.title}
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                {currentAd.description}
              </p>
              
              <Button
                size="sm"
                onClick={handleClick}
                className={`text-xs ${
                  currentAd.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  currentAd.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {currentAd.cta}
                <ExternalLink size={12} className="ml-1" />
              </Button>

              {/* Revenue indicator for demo */}
              {currentAd.revenue && (
                <div className="text-xs text-gray-400 mt-2">
                  Ad revenue: ${currentAd.revenue.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {renderAdContent()}
    </AnimatePresence>
  );
}