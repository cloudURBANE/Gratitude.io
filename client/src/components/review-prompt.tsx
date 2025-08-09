import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";

interface ReviewPromptProps {
  worker: {
    id: string;
    name: string;
    role: string;
    googleReviewUrl?: string;
    yelpReviewUrl?: string;
  };
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewPrompt({ worker, onClose, onReviewSubmitted }: ReviewPromptProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'yelp' | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const trackReviewMutation = useMutation({
    mutationFn: async (data: { workerId: string; platform: string; rating: number; hasText: boolean }) => {
      return await apiRequest("POST", "/api/review-interactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers", worker.id, "analytics"] });
    },
  });

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      setShowReviewForm(true);
    } else {
      // For lower ratings, show feedback form instead of public review
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input and will work to improve.",
      });
      onClose();
    }
  };

  const handlePlatformSelect = (platform: 'google' | 'yelp') => {
    setSelectedPlatform(platform);
    
    // Track the interaction
    trackReviewMutation.mutate({
      workerId: worker.id,
      platform,
      rating: selectedRating,
      hasText: reviewText.length > 0,
    });

    // Open the review URL
    const reviewUrl = platform === 'google' ? worker.googleReviewUrl : worker.yelpReviewUrl;
    if (reviewUrl) {
      window.open(reviewUrl, '_blank');
    }

    toast({
      title: "Review link opened!",
      description: `Thank you for leaving a review for ${worker.name}!`,
    });

    onReviewSubmitted();
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isActive = starNumber <= (hoverRating || selectedRating);
      
      return (
        <button
          key={i}
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => setHoverRating(starNumber)}
          onMouseLeave={() => setHoverRating(0)}
          className={`text-3xl transition-all duration-200 hover:scale-110 ${
            isActive ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          ★
        </button>
      );
    });
  };

  const getRatingMessage = () => {
    if (selectedRating === 0) return "How was your experience?";
    if (selectedRating <= 2) return "We're sorry to hear that. Your feedback helps us improve.";
    if (selectedRating === 3) return "Thank you for your feedback!";
    return "Awesome! Would you mind sharing your experience online?";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Rate Your Experience</h2>
          <p className="text-text-secondary">with {worker.name}</p>
        </div>

        {!showReviewForm ? (
          <div className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-4">
                {renderStars()}
              </div>
              <p className="text-text-primary font-medium">{getRatingMessage()}</p>
            </div>

            {selectedRating > 0 && selectedRating < 4 && (
              <div className="space-y-4">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us how we can improve (optional)"
                  className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20 resize-none h-24"
                />
                <GradientButton onClick={onClose} className="w-full">
                  Submit Feedback
                </GradientButton>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Share Your Great Experience!</h3>
              <p className="text-text-secondary mb-4">Your review helps {worker.name} and others like them</p>
            </div>

            {/* Optional review text */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                What made your experience great? (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`${worker.name} provided excellent service...`}
                className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20 resize-none h-24"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <p className="text-sm text-text-secondary text-center">Choose where to leave your review:</p>
              
              <div className="grid grid-cols-2 gap-3">
                {worker.googleReviewUrl && (
                  <button
                    onClick={() => handlePlatformSelect('google')}
                    className="flex items-center justify-center gap-2 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      G
                    </div>
                    <span className="font-medium">Google</span>
                  </button>
                )}

                {worker.yelpReviewUrl && (
                  <button
                    onClick={() => handlePlatformSelect('yelp')}
                    className="flex items-center justify-center gap-2 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      Y
                    </div>
                    <span className="font-medium">Yelp</span>
                  </button>
                )}
              </div>

              {(!worker.googleReviewUrl && !worker.yelpReviewUrl) && (
                <div className="text-center py-4">
                  <p className="text-text-secondary text-sm mb-3">Review links not set up yet</p>
                  <button
                    onClick={onClose}
                    className="text-accent-start hover:text-accent-end transition-colors text-sm"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}