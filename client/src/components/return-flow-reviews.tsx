import { motion } from "framer-motion";
import EnhancedGlassCard from "./enhanced-glass-card";

interface Worker {
  googleReviewUrl?: string;
  yelpReviewUrl?: string;
}

interface ReturnFlowReviewsProps {
  worker: Worker;
  onClose: () => void;
  onReviewClick: (type: 'google' | 'yelp') => void;
}

export default function ReturnFlowReviews({ 
  worker, 
  onClose, 
  onReviewClick 
}: ReturnFlowReviewsProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.4
      }}
    >
      <EnhancedGlassCard 
        className="p-4 border border-accent-start/20"
        depth="modal"
        glowIntensity={0.3}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                You made their day! ✨
              </h3>
              <p className="text-xs text-text-secondary">
                Leave a quick 5⭐ note?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          {worker.googleReviewUrl && (
            <motion.button
              onClick={() => onReviewClick('google')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-glass hover:bg-glass-border rounded-lg transition-all duration-200 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-text-primary">Google</span>
            </motion.button>
          )}

          {worker.yelpReviewUrl && (
            <motion.button
              onClick={() => onReviewClick('yelp')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-glass hover:bg-glass-border rounded-lg transition-all duration-200 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 12.013l3.234 2.394a.8.8 0 0 0 1.24-.672l.228-1.39a.8.8 0 0 0-.287-.849L13.25 9.525a.8.8 0 0 0-1.233.697v1.791z"/>
                <path d="M12.017 12.013l-3.234 2.394a.8.8 0 0 1-1.24-.672l-.228-1.39a.8.8 0 0 1 .287-.849l3.182-1.971a.8.8 0 0 1 1.233.697v1.791z"/>
                <path d="M12.017 12.013L8.783 9.619a.8.8 0 0 0-1.24.672l-.228 1.39a.8.8 0 0 0 .287.849l3.182 1.971a.8.8 0 0 0 1.233-.697v-1.791z"/>
                <path d="M12.017 12.013l3.234-2.394a.8.8 0 0 1 1.24.672l.228 1.39a.8.8 0 0 1-.287.849l-3.182 1.971a.8.8 0 0 1-1.233-.697v-1.791z"/>
                <path d="M12 2.475L8.683 3.85a.8.8 0 0 0-.287.849l.228 1.39a.8.8 0 0 0 1.24.672L12 4.366a.8.8 0 0 0 0-1.891z"/>
              </svg>
              <span className="text-text-primary">Yelp</span>
            </motion.button>
          )}
        </div>
      </EnhancedGlassCard>
    </motion.div>
  );
}