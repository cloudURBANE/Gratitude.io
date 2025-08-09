import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Sparkles } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  body: string;
  cta: string;
  url: string;
  type: 'house' | 'contextual';
  trackingPixel?: string;
}

interface AdSlotProps {
  slot: 'return' | 'dashboard_side';
  profileId?: string;
  sessionId?: string;
  className?: string;
}

export function AdSlot({ slot, profileId, sessionId, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [slot, profileId]);

  const fetchAd = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const response = await fetch('/api/ads/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot,
          profileId,
          sessionId,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });

      if (response.ok) {
        const adData = await response.json();
        if (adData.ad) {
          setAd(adData.ad);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ad:', error);
      setHasError(true);
      // Fallback to house ad
      setAd(getHouseAd());
    } finally {
      setIsLoading(false);
    }
  };

  const getHouseAd = (): Ad => {
    const houseAds: Ad[] = [
      {
        id: 'house-pro-upgrade',
        title: '✨ Go Ad-Free with TipVault Pro',
        body: 'Remove ads, get custom branding, detailed analytics, and more premium features.',
        cta: 'Upgrade to Pro',
        url: '/upgrade',
        type: 'house',
      },
      {
        id: 'house-nfc-kit',
        title: '🏷️ Get Your NFC Tap Kit',
        body: 'Physical NFC cards + QR stickers. Customers just tap to tip with prefilled amounts.',
        cta: 'Order Kit ($15)',
        url: '/shop/nfc-kit',
        type: 'house',
      },
      {
        id: 'house-custom-domain',
        title: '🌐 Get a Custom Domain',
        body: 'Use your own domain like tips.yourbrand.com instead of tipvault.app/u/handle',
        cta: 'Add Domain',
        url: '/settings/domain',
        type: 'house',
      }
    ];

    return houseAds[Math.floor(Math.random() * houseAds.length)];
  };

  const handleClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          slot,
          profileId,
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }

    // Open URL
    if (ad.url.startsWith('/')) {
      // Internal URL
      window.location.href = ad.url;
    } else {
      // External URL
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = async () => {
    setIsDismissed(true);
    
    // Track dismissal
    try {
      await fetch('/api/ads/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad?.id,
          slot,
          profileId,
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to track ad dismissal:', error);
    }
  };

  // Don't render if dismissed or no ad
  if (isDismissed || (!ad && !isLoading)) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
            <div className="h-4 w-4 bg-muted-foreground/20 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
          </div>
          <div className="h-8 bg-muted-foreground/20 rounded w-1/3 mt-3"></div>
        </div>
      </div>
    );
  }

  if (!ad) return null;

  const getAdIcon = () => {
    switch (ad.type) {
      case 'house':
        if (ad.id.includes('pro')) return <Sparkles size={16} className="text-purple-500" />;
        if (ad.id.includes('nfc')) return <Star size={16} className="text-blue-500" />;
        return <Star size={16} className="text-green-500" />;
      default:
        return <ExternalLink size={16} className="text-muted-foreground" />;
    }
  };

  const getAdGradient = () => {
    switch (ad.type) {
      case 'house':
        if (ad.id.includes('pro')) return 'from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10';
        if (ad.id.includes('nfc')) return 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10';
        return 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <div className={`relative bg-gradient-to-br ${getAdGradient()} border border-muted rounded-xl p-4 hover:shadow-md transition-all duration-200 group`}>
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Dismiss ad"
          >
            <X size={14} className="text-muted-foreground" />
          </button>

          {/* Ad content */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getAdIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground leading-tight mb-1">
                {ad.title}
              </h4>
              
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {ad.body}
              </p>
              
              <motion.button
                onClick={handleClick}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  ad.type === 'house'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {ad.cta}
                {!ad.url.startsWith('/') && (
                  <ExternalLink size={10} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Sponsored label */}
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              {ad.type === 'house' ? 'TipVault' : 'Sponsored'}
            </span>
          </div>

          {/* Tracking pixel */}
          {ad.trackingPixel && (
            <img
              src={ad.trackingPixel}
              alt=""
              width="1"
              height="1"
              style={{ display: 'none' }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}