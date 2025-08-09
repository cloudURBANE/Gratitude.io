// Ad system for free tier revenue generation
export interface AdConfig {
  id: string;
  type: 'banner' | 'interstitial' | 'native' | 'video';
  placement: string;
  priority: number;
  targeting?: {
    location?: string[];
    userType?: string[];
    timeOfDay?: string[];
  };
  revenue: {
    cpm: number; // Cost per mille (thousand impressions)
    cpc: number; // Cost per click
    expectedCTR: number; // Expected click-through rate
  };
}

// Mock ad configurations for different placements
export const adConfigs: AdConfig[] = [
  {
    id: 'tip_page_banner',
    type: 'banner',
    placement: 'tip_page_bottom',
    priority: 1,
    targeting: {
      userType: ['free'],
      timeOfDay: ['peak_hours']
    },
    revenue: {
      cpm: 3.50,
      cpc: 0.25,
      expectedCTR: 2.8
    }
  },
  {
    id: 'dashboard_sidebar',
    type: 'native',
    placement: 'dashboard_side',
    priority: 2,
    targeting: {
      userType: ['free']
    },
    revenue: {
      cpm: 4.20,
      cpc: 0.35,
      expectedCTR: 3.2
    }
  },
  {
    id: 'checkout_interstitial',
    type: 'interstitial',
    placement: 'checkout_upsell',
    priority: 3,
    targeting: {
      userType: ['free'],
      timeOfDay: ['conversion_hours']
    },
    revenue: {
      cpm: 8.50,
      cpc: 0.85,
      expectedCTR: 4.1
    }
  }
];

// Revenue tracking interface
export interface AdMetrics {
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  placement: string;
  date: Date;
}

// Ad service class for managing ad operations
export class AdService {
  private metrics: AdMetrics[] = [];
  
  // Get appropriate ad for placement
  getAdForPlacement(placement: string, userTier: string = 'free'): AdConfig | null {
    if (userTier !== 'free') return null;
    
    const availableAds = adConfigs.filter(ad => 
      ad.placement === placement && 
      (!ad.targeting?.userType || ad.targeting.userType.includes(userTier))
    );
    
    // Sort by priority and expected revenue
    return availableAds.sort((a, b) => {
      const revenueA = a.revenue.cpm + (a.revenue.cpc * a.revenue.expectedCTR * 10);
      const revenueB = b.revenue.cpm + (b.revenue.cpc * b.revenue.expectedCTR * 10);
      return revenueB - revenueA;
    })[0] || null;
  }
  
  // Track ad impression
  trackImpression(adId: string, placement: string): void {
    const config = adConfigs.find(ad => ad.id === adId);
    if (!config) return;
    
    const revenue = config.revenue.cpm / 1000;
    this.addMetric({
      impressions: 1,
      clicks: 0,
      revenue,
      ctr: 0,
      placement,
      date: new Date()
    });
    
    // Send to analytics endpoint (would be real in production)
    this.sendAnalytics('impression', { adId, placement, revenue });
  }
  
  // Track ad click
  trackClick(adId: string, placement: string): void {
    const config = adConfigs.find(ad => ad.id === adId);
    if (!config) return;
    
    const revenue = config.revenue.cpc;
    this.addMetric({
      impressions: 0,
      clicks: 1,
      revenue,
      ctr: 0,
      placement,
      date: new Date()
    });
    
    // Send to analytics endpoint
    this.sendAnalytics('click', { adId, placement, revenue });
  }
  
  // Get revenue metrics for dashboard
  getRevenueMetrics(days: number = 30): {
    totalRevenue: number;
    dailyAverage: number;
    topPlacements: { placement: string; revenue: number }[];
    impressions: number;
    clicks: number;
    averageCTR: number;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.date >= cutoffDate);
    
    const totalRevenue = recentMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalImpressions = recentMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = recentMetrics.reduce((sum, m) => sum + m.clicks, 0);
    
    // Group by placement for top performers
    const placementRevenue = recentMetrics.reduce((acc, m) => {
      acc[m.placement] = (acc[m.placement] || 0) + m.revenue;
      return acc;
    }, {} as Record<string, number>);
    
    const topPlacements = Object.entries(placementRevenue)
      .map(([placement, revenue]) => ({ placement, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalRevenue,
      dailyAverage: totalRevenue / days,
      topPlacements,
      impressions: totalImpressions,
      clicks: totalClicks,
      averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    };
  }
  
  private addMetric(metric: AdMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  private sendAnalytics(event: string, data: any): void {
    // In production, this would send to real analytics service
    console.log('Ad Analytics:', { event, data });
    
    // Could integrate with Google Analytics, Mixpanel, etc.
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'ad_' + event, {
        event_category: 'monetization',
        event_label: data.placement,
        value: Math.round(data.revenue * 100) // Convert to cents
      });
    }
  }
}

// Global ad service instance
export const adService = new AdService();

// Helper to check if user is on free tier
export const isFreeTier = (): boolean => {
  try {
    const subscription = localStorage.getItem('tipvault-subscription');
    if (!subscription) return true;
    
    const data = JSON.parse(subscription);
    return data.plan === 'free' || !data.plan;
  } catch {
    return true; // Default to free tier
  }
};

// Calculate monthly revenue projection
export const getMonthlyRevenueProjection = (): {
  conservativeEstimate: number;
  optimisticEstimate: number;
  breakdown: {
    impressions: number;
    clicks: number;
    impressionRevenue: number;
    clickRevenue: number;
  };
} => {
  // Based on typical free tier usage patterns
  const monthlyActiveUsers = 1000; // Conservative estimate for MVP
  const avgSessionsPerUser = 8;
  const avgAdViewsPerSession = 3;
  
  const monthlyImpressions = monthlyActiveUsers * avgSessionsPerUser * avgAdViewsPerSession;
  const avgCPM = 4.0; // Average across all ad types
  const avgCTR = 3.0; // 3% click-through rate
  const avgCPC = 0.40;
  
  const monthlyClicks = (monthlyImpressions * avgCTR) / 100;
  const impressionRevenue = (monthlyImpressions / 1000) * avgCPM;
  const clickRevenue = monthlyClicks * avgCPC;
  
  const conservativeEstimate = (impressionRevenue + clickRevenue) * 0.7; // 70% of optimal
  const optimisticEstimate = (impressionRevenue + clickRevenue) * 1.3; // 130% of optimal
  
  return {
    conservativeEstimate,
    optimisticEstimate,
    breakdown: {
      impressions: monthlyImpressions,
      clicks: monthlyClicks,
      impressionRevenue,
      clickRevenue
    }
  };
};