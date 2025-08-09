import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateUniqueReview, generateReviewUrls } from "@/lib/review-generator";
import { useToast } from "@/hooks/use-toast";

interface ReturnToReviewProps {
  workerName: string;
  workerLocation?: string;
  workerRole?: string;
  onReviewClick: (platform: 'google' | 'yelp' | 'wallet') => void;
  className?: string;
}

export default function ReturnToReview({ 
  workerName, 
  workerLocation, 
  workerRole = "service professional",
  onReviewClick, 
  className = "" 
}: ReturnToReviewProps) {
  const [showChips, setShowChips] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [showReviewText, setShowReviewText] = useState(false);
  const [generatedReview, setGeneratedReview] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Only show once per session
    if (hasShown) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && !hasShown) {
        // Debounce to prevent rapid firing
        setTimeout(() => {
          if (!document.hidden) {
            setShowChips(true);
            setHasShown(true);
          }
        }, 1000);
      }
    };

    // Listen for return to page (after payment handoff)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasShown]);

  const handleGenerateReview = () => {
    const review = generateUniqueReview({
      name: workerName,
      role: workerRole,
      location: workerLocation || "local business"
    });
    setGeneratedReview(review);
    setShowReviewText(true);
  };

  const handleCopyReview = async () => {
    try {
      await navigator.clipboard.writeText(generatedReview);
      toast({
        title: "Review copied!",
        description: "Paste it when you write your review",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive"
      });
    }
  };

  const handleChipClick = (platform: 'google' | 'yelp' | 'wallet') => {
    if (platform === 'google' || platform === 'yelp') {
      const reviewUrls = generateReviewUrls({
        name: workerName,
        role: workerRole,
        location: workerLocation || "local business"
      });
      window.open(reviewUrls[platform], '_blank');
    } else {
      onReviewClick(platform);
    }
    setShowChips(false);
  };

  if (!showChips) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-20 left-4 right-4 z-50 ${className}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="bg-glass backdrop-blur-md border border-glass-border rounded-2xl p-4 shadow-2xl">
          {!showReviewText ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-text-primary text-center mb-3">
                Help {workerName} with a quick review?
              </p>
              <motion.button
                onClick={handleGenerateReview}
                className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white rounded-lg py-2 px-4 text-sm font-medium mb-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate Review Text
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="bg-glass-interactive border border-glass-border rounded-lg p-3 mb-3">
                <p className="text-sm text-text-primary leading-relaxed">
                  {generatedReview}
                </p>
              </div>
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={handleCopyReview}
                  className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1"
                >
                  📋 Copy Review
                </button>
                <button
                  onClick={handleGenerateReview}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  🔄 Generate New
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            {/* Google chip */}
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl transition-all duration-200"
              onClick={() => handleChipClick('google')}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.18, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-text-primary">Google</span>
            </motion.button>

            {/* Yelp chip */}
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl transition-all duration-200"
              onClick={() => handleChipClick('yelp')}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.18, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 12.013l3.234 2.394a.8.8 0 0 0 1.24-.672l.228-1.39a.8.8 0 0 0-.287-.849L13.25 9.525a.8.8 0 0 0-1.233.697v1.791z"/>
                <path d="M12.017 12.013l-3.234 2.394a.8.8 0 0 1-1.24-.672l-.228-1.39a.8.8 0 0 1 .287-.849l3.182-1.971a.8.8 0 0 1 1.233.697v1.791z"/>
                <path d="M12.017 12.013L8.783 9.619a.8.8 0 0 0-1.24.672l-.228 1.39a.8.8 0 0 0 .287.849l3.182 1.971a.8.8 0 0 0 1.233-.697v-1.791z"/>
                <path d="M12.017 12.013l3.234-2.394a.8.8 0 0 1 1.24.672l.228 1.39a.8.8 0 0 1-.287.849l-3.182 1.971a.8.8 0 0 1-1.233-.697v-1.791z"/>
                <path d="M12 2.475L8.683 3.85a.8.8 0 0 0-.287.849l.228 1.39a.8.8 0 0 0 1.24.672L12 4.366a.8.8 0 0 0 0-1.891z"/>
              </svg>
              <span className="text-sm font-medium text-text-primary">Yelp</span>
            </motion.button>

            {/* Wallet chip */}
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl transition-all duration-200"
              onClick={() => handleChipClick('wallet')}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.18, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-medium text-text-primary">Wallet</span>
            </motion.button>
          </div>

          {/* Dismiss button */}
          <motion.button
            className="absolute -top-2 -right-2 w-6 h-6 bg-glass border border-glass-border rounded-full flex items-center justify-center"
            onClick={() => setShowChips(false)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}