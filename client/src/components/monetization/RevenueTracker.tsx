import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Eye, MousePointer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adService, getMonthlyRevenueProjection } from "@/lib/ads";

interface RevenueTrackerProps {
  className?: string;
}

export default function RevenueTracker({ className = "" }: RevenueTrackerProps) {
  const [metrics, setMetrics] = useState(() => adService.getRevenueMetrics(30));
  const [projection, setProjection] = useState(() => getMonthlyRevenueProjection());

  useEffect(() => {
    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setMetrics(adService.getRevenueMetrics(30));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ad Revenue</h3>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${metrics.dailyAverage.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Daily Average</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Eye size={24} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.impressions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Impressions</div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MousePointer size={24} className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.averageCTR.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Click Rate</div>
          </div>
        </div>
      </Card>

      {/* Monthly Projection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Projection</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Conservative Estimate</span>
            <span className="font-semibold text-gray-900">
              ${projection.conservativeEstimate.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-600">Optimistic Estimate</span>
            <span className="font-semibold text-green-700">
              ${projection.optimisticEstimate.toFixed(2)}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Impression Revenue</span>
                <span className="text-gray-900">
                  ${projection.breakdown.impressionRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Click Revenue</span>
                <span className="text-gray-900">
                  ${projection.breakdown.clickRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Impressions</span>
                <span className="text-gray-900">
                  {projection.breakdown.impressions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Clicks</span>
                <span className="text-gray-900">
                  {Math.round(projection.breakdown.clicks).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Performing Placements */}
      {metrics.topPlacements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Placements</h3>
          
          <div className="space-y-3">
            {metrics.topPlacements.slice(0, 3).map((placement, index) => (
              <motion.div
                key={placement.placement}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <span className="font-medium text-gray-900">
                    {placement.placement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="font-semibold text-green-600">
                  ${placement.revenue.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Optimization Tips */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          💡 Revenue Optimization Tips
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">
              <strong>Upgrade to Pro</strong> to unlock premium ad placements and higher revenue rates
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">
              <strong>Peak Hours:</strong> Most ad revenue comes from 11AM-2PM and 6PM-9PM
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">
              <strong>User Engagement:</strong> Higher tip page views = more ad impressions
            </p>
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = '/pricing'}
        >
          Upgrade to Boost Revenue
          <TrendingUp size={16} className="ml-2" />
        </Button>
      </Card>
    </div>
  );
}