import { useEffect } from "react";
import { Link } from "wouter";
import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import Confetti from "@/components/confetti";

export default function Success() {
  useEffect(() => {
    // Small delay to ensure the page is rendered before confetti starts
    const timer = setTimeout(() => {
      // Confetti will be rendered by the Confetti component
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'I just sent a tip!',
        text: 'I just tipped a service worker using TipLink - the easiest way to show appreciation!',
        url: window.location.origin,
      });
    } else {
      // Fallback to copying to clipboard
      const text = 'I just tipped a service worker using TipLink - the easiest way to show appreciation! ' + window.location.origin;
      navigator.clipboard.writeText(text);
    }
  };

  const handleLeaveReview = () => {
    // This would typically redirect to a review selection page
    window.alert('Review options coming soon!');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Confetti />
      
      <div className="max-w-md mx-auto px-4 text-center">
        <GlassCard className="rounded-2xl p-8 animate-bounce-in">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
            alt="Payment success celebration" 
            className="w-24 h-24 mx-auto mb-6 rounded-full object-cover" 
          />
          
          <h1 className="text-3xl font-bold text-text-primary mb-2">You made their day! 🎉</h1>
          <p className="text-text-secondary mb-6">Your tip has been sent successfully.</p>
          
          <div className="space-y-4">
            <GradientButton 
              className="w-full py-3"
              onClick={handleShare}
            >
              Share this moment
            </GradientButton>
            
            <button 
              className="w-full py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200 focus-visible" 
              onClick={handleLeaveReview}
            >
              Leave a review
            </button>
            
            <Link href="/">
              <button className="w-full py-3 px-4 text-text-secondary hover:text-text-primary transition-colors focus-visible">
                ← Back to home
              </button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
