import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import GlassCard from "@/components/glass-card";

interface ReviewStatsProps {
  workerId: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  googleReviews: number;
  yelpReviews: number;
  recentReviews: Array<{
    platform: string;
    rating: number;
    date: string;
    hasText: boolean;
  }>;
  conversionRate: number; // % of tip sessions that result in reviews
}

export default function ReviewStats({ workerId }: ReviewStatsProps) {
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ["/api/workers", workerId, "review-stats"],
    enabled: !!workerId && workerId !== 'demo-id',
  });

  // Demo data for demo worker
  const demoStats: ReviewStats = {
    totalReviews: 47,
    averageRating: 4.8,
    googleReviews: 32,
    yelpReviews: 15,
    recentReviews: [
      { platform: 'google', rating: 5, date: '2025-01-07', hasText: true },
      { platform: 'yelp', rating: 5, date: '2025-01-06', hasText: true },
      { platform: 'google', rating: 4, date: '2025-01-05', hasText: false },
      { platform: 'google', rating: 5, date: '2025-01-04', hasText: true },
    ],
    conversionRate: 23.5,
  };

  const displayStats = workerId === 'demo-id' ? demoStats : stats;

  if (!displayStats) return null;

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'}`}>
        ★
      </span>
    ));
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Review Performance</h3>
        <div className="flex items-center gap-2">
          {renderStarRating(displayStats.averageRating)}
          <span className="text-text-primary font-medium">{displayStats.averageRating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">{displayStats.totalReviews}</div>
          <div className="text-xs text-text-secondary">Total Reviews</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{displayStats.googleReviews}</div>
          <div className="text-xs text-text-secondary">Google</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">{displayStats.yelpReviews}</div>
          <div className="text-xs text-text-secondary">Yelp</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-success mb-1">{displayStats.conversionRate}%</div>
          <div className="text-xs text-text-secondary">Conversion</div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-secondary">Recent Review Activity</h4>
        {displayStats.recentReviews.slice(0, 3).map((review, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 bg-glass-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                review.platform === 'google' ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-red-500'
              }`}>
                {review.platform === 'google' ? 'G' : 'Y'}
              </div>
              <div className="flex items-center gap-1">
                {renderStarRating(review.rating)}
              </div>
              {review.hasText && (
                <div className="w-2 h-2 bg-accent-start rounded-full" title="Written review"></div>
              )}
            </div>
            <div className="text-xs text-text-secondary">
              {new Date(review.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-semibold text-text-primary">Review Impact</span>
        </div>
        <p className="text-xs text-text-secondary">
          Workers with {displayStats.averageRating}+ stars earn 35% more in tips on average
        </p>
      </div>
    </GlassCard>
  );
}