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

// Sample ad data - in production this would come from an ad network API
const adData = {
  return: {
    id: "ad_return_001",
    title: "Get More Tips with Pro",
    description: "Upgrade to Pro for unlimited tip pages and advanced analytics. 7-day free trial!",
    cta: "Start Free Trial",
    bgGradient: "from-green-600 to-emerald-600",
    icon: "💰"
  },
  dashboard_side: {
    id: "ad_dashboard_001", 
    title: "NFC Tap Cards",
    description: "Instant tips with just a tap. Order your custom NFC cards today.",
    cta: "Order Now",
    bgGradient: "from-blue-600 to-purple-600",
    icon: "📱"
  },
  tip_page_footer: {
    id: "ad_footer_001",
    title: "QR Code Generator",
    description: "Create beautiful QR codes for your tip page in seconds.",
    cta: "Generate QR",
    bgGradient: "from-purple-600 to-pink-600", 
    icon: "🔗"
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={className}
      >
        <GlassCard className="relative p-4 cursor-pointer group hover:scale-105 transition-transform duration-200">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} className="text-white" />
          </button>

          <div onClick={handleClick} className="space-y-3">
            {/* Ad content */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${ad.bgGradient} rounded-lg flex items-center justify-center text-lg`}>
                {ad.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">
                  {ad.title}
                </h4>
                <p className="text-gray-300 text-xs leading-tight">
                  {ad.description}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 italic">sponsored</span>
              <div className={`bg-gradient-to-r ${ad.bgGradient} px-3 py-1 rounded-full flex items-center gap-1`}>
                <span className="text-white text-xs font-medium">{ad.cta}</span>
                <ExternalLink size={10} className="text-white" />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}