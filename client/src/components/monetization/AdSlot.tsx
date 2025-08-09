import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import GlassCard from "@/components/glass-card";

interface AdSlotProps {
  slot: "return" | "dashboard_side" | "tip_page_footer";
  className?: string;
  onImpressionTracked?: (adId: string) => void;
  onAdClicked?: (adId: string) => void;
}

// Smart revenue opportunities - contextual and helpful, not intrusive
const adData = {
  return: {
    id: "ad_return_001",
    title: "Upgrade to unlock more features",
    description: "Get unlimited tip pages, advanced analytics, and custom branding with Pro.",
    cta: "Explore Pro",
    bgGradient: "from-blue-600 to-blue-700",
    icon: "✨"
  },
  dashboard_side: {
    id: "ad_dashboard_001", 
    title: "Custom QR Codes",
    description: "Professional QR codes with your branding. Increase tips by 45%.",
    cta: "Create QR Code",
    bgGradient: "from-gray-700 to-gray-800",
    icon: "📊"
  },
  tip_page_footer: {
    id: "ad_footer_001",
    title: "Analytics Insights",
    description: "Track your best-performing hours and optimize your earnings.",
    cta: "View Analytics",
    bgGradient: "from-green-600 to-green-700", 
    icon: "📈"
  }
};

export default function AdSlot({ slot, className, onImpressionTracked, onAdClicked }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  const ad = adData[slot];

  useEffect(() => {
    if (!hasTrackedImpression && onImpressionTracked) {
      onImpressionTracked(ad.id);
      setHasTrackedImpression(true);
    }
  }, [hasTrackedImpression, onImpressionTracked, ad.id]);

  const handleClick = () => {
    if (onAdClicked) {
      onAdClicked(ad.id);
    }
    
    // In production, this would redirect to the actual ad destination
    console.log(`Ad clicked: ${ad.id}`);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={className}
      >
        <div className="relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer group hover:shadow-lg transition-all duration-200">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} className="text-gray-600" />
          </button>

          <div onClick={handleClick} className="space-y-3">
            {/* Ad content */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${ad.bgGradient} rounded-lg flex items-center justify-center text-lg`}>
                {ad.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {ad.title}
                </h4>
                <p className="text-gray-600 text-xs leading-tight">
                  {ad.description}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Suggested feature</span>
              <div className={`bg-gradient-to-r ${ad.bgGradient} px-3 py-1 rounded-lg flex items-center gap-1`}>
                <span className="text-white text-xs font-medium">{ad.cta}</span>
                <ExternalLink size={10} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}