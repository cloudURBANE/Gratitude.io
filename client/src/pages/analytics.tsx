import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { EarningsChart } from '@/components/analytics/EarningsChart';
import { TipHeatmap } from '@/components/analytics/TipHeatmap';
import { useEntitlements } from '@/hooks/useEntitlements';
import AdSlot from '@/components/monetization/AdSlot';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  BarChart3,
  Activity,
  Crown,
  Lock
} from 'lucide-react';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const { entitlements, isPro } = useEntitlements();
  
  // Mock profile ID for demo - would come from auth context
  const profileId = 'demo-profile-123';
  
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics', profileId, timeframe],
    queryFn: () => 
      fetch(`/api/analytics/${profileId}?days=${timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90}`)
        .then(res => res.json())
  });

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['/api/analytics', profileId, 'heatmap', timeframe],
    queryFn: () => 
      fetch(`/api/analytics/${profileId}/heatmap?days=${timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90}`)
        .then(res => res.json())
  });

  // Generate mock data for demo when API returns empty
  const mockData = {
    totalTips: 127,
    totalAmount: 1485.50,
    averageTip: 11.69,
    conversionRate: 24.5,
    qrScans: 518,
    peakHours: [
      { hour: 18, tips: 23, amount: 276.50 },
      { hour: 12, tips: 18, amount: 198.75 },
      { hour: 19, tips: 15, amount: 189.25 }
    ],
    dailyTrends: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.round((Math.random() * 80 + 20) * 100) / 100,
        tips: Math.floor(Math.random() * 8) + 2,
        avgTip: Math.round((Math.random() * 8 + 6) * 100) / 100
      };
    })
  };

  const data = analyticsData?.totalTips > 0 ? analyticsData : mockData;

  if (analyticsLoading && !data) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your tip performance and optimize earnings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isPro && (
              <Badge variant="outline" className="gap-1">
                <Lock className="w-3 h-3" />
                Limited Access
              </Badge>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className="text-xs"
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Earnings"
            value={`$${data.totalAmount.toFixed(2)}`}
            description={`From ${data.totalTips} tips`}
            icon={DollarSign}
            trend={{ value: 12.3, isPositive: true }}
          />
          
          <StatsCard
            title="Average Tip"
            value={`$${data.averageTip.toFixed(2)}`}
            description="Per transaction"
            icon={Target}
            trend={{ value: 8.7, isPositive: true }}
          />
          
          <StatsCard
            title="Conversion Rate"
            value={`${data.conversionRate.toFixed(1)}%`}
            description={`${data.qrScans} QR scans`}
            icon={TrendingUp}
            trend={{ value: 3.2, isPositive: true }}
          />
          
          <StatsCard
            title="Peak Hour"
            value={data.peakHours[0] ? `${data.peakHours[0].hour > 12 ? data.peakHours[0].hour - 12 : data.peakHours[0].hour}${data.peakHours[0].hour >= 12 ? 'PM' : 'AM'}` : '--'}
            description={data.peakHours[0] ? `${data.peakHours[0].tips} tips` : 'No data'}
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Earnings Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EarningsChart 
                data={data.dailyTrends} 
                timeframe={timeframe}
              />
            </motion.div>

            {/* Tip Heatmap - Pro Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isPro ? (
                <TipHeatmap data={heatmapData || []} />
              ) : (
                <Card className="p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                  <div className="relative space-y-4">
                    <Crown className="w-12 h-12 text-purple-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Tip Heatmap</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      See when your customers tip most. Upgrade to Pro to unlock detailed heatmaps.
                    </p>
                    <Button className="mt-4">
                      Upgrade to Pro
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Insights */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Insights
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Best day</span>
                  <span className="font-medium">Saturday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg per day</span>
                  <span className="font-medium">${(data.totalAmount / 30).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Growth trend</span>
                  <Badge className="text-xs">
                    +12.3%
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Goals */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Monthly Goal
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">73%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ${data.totalAmount.toFixed(2)} of $2,000 goal
                </div>
              </div>
            </Card>

            {/* Ad Slot - Clean Sidebar Placement */}
            <AdSlot placement="dashboard_side" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}