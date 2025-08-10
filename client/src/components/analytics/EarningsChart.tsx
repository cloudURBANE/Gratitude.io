import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EarningsData {
  date: string;
  amount: number;
  tips: number;
  avgTip: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  timeframe: '7d' | '30d' | '90d';
}

export function EarningsChart({ data, timeframe }: EarningsChartProps) {
  // Calculate trends
  const totalAmount = data.reduce((sum, day) => sum + day.amount, 0);
  const totalTips = data.reduce((sum, day) => sum + day.tips, 0);
  const avgTip = totalTips > 0 ? totalAmount / totalTips : 0;
  
  // Calculate week-over-week growth (simplified)
  const midPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midPoint);
  const secondHalf = data.slice(midPoint);
  
  const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.amount, 0);
  const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.amount, 0);
  const growthRate = firstHalfTotal > 0 ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 : 0;

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Earnings Trend
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {timeframe === '7d' ? 'Last 7 days' : timeframe === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalAmount.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {growthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(growthRate).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => [
                name === 'amount' ? `$${value.toFixed(2)}` : value,
                name === 'amount' ? 'Earnings' : name === 'tips' ? 'Tips' : 'Avg Tip'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalTips}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Tips
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${avgTip.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Avg Tip
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${(totalAmount / data.length).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Daily Avg
          </div>
        </div>
      </div>
    </Card>
  );
}