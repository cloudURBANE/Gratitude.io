import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import GlassCard from "@/components/glass-card";

interface Analytics {
  date: string;
  totalTips: number;
  totalAmount: string;
  avgTipAmount: string;
  qrScans: number;
  conversionRate: string;
}

interface Worker {
  id: string;
  name: string;
  handle: string;
}

export default function Analytics() {
  const { handle } = useParams<{ handle: string }>();

  const { data: worker } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle && handle !== 'demo',
  });

  const { data: analytics } = useQuery<Analytics[]>({
    queryKey: ["/api/workers", worker?.id, "analytics"],
    enabled: !!worker?.id,
  });

  // Demo analytics data for 'demo' handle
  const demoAnalytics: Analytics[] = [
    { date: '2025-01-01', totalTips: 12, totalAmount: '156.00', avgTipAmount: '13.00', qrScans: 18, conversionRate: '66.7' },
    { date: '2025-01-02', totalTips: 8, totalAmount: '94.00', avgTipAmount: '11.75', qrScans: 12, conversionRate: '66.7' },
    { date: '2025-01-03', totalTips: 15, totalAmount: '189.00', avgTipAmount: '12.60', qrScans: 22, conversionRate: '68.2' },
    { date: '2025-01-04', totalTips: 10, totalAmount: '125.00', avgTipAmount: '12.50', qrScans: 16, conversionRate: '62.5' },
    { date: '2025-01-05', totalTips: 18, totalAmount: '234.00', avgTipAmount: '13.00', qrScans: 25, conversionRate: '72.0' },
    { date: '2025-01-06', totalTips: 14, totalAmount: '168.00', avgTipAmount: '12.00', qrScans: 20, conversionRate: '70.0' },
    { date: '2025-01-07', totalTips: 16, totalAmount: '208.00', avgTipAmount: '13.00', qrScans: 23, conversionRate: '69.6' },
  ];

  const displayAnalytics = handle === 'demo' ? demoAnalytics : analytics || [];

  // Chart data processing
  const chartData = displayAnalytics.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tips: day.totalTips,
    amount: parseFloat(day.totalAmount),
    conversion: parseFloat(day.conversionRate),
  }));

  const paymentMethodData = [
    { name: 'Stripe', value: 45, color: '#8B5CF6' },
    { name: 'Venmo', value: 30, color: '#06B6D4' },
    { name: 'Cash App', value: 20, color: '#10B981' },
    { name: 'Zelle', value: 5, color: '#F59E0B' },
  ];

  const totalEarnings = displayAnalytics.reduce((sum, day) => sum + parseFloat(day.totalAmount), 0);
  const totalTips = displayAnalytics.reduce((sum, day) => sum + day.totalTips, 0);
  const avgConversion = displayAnalytics.reduce((sum, day) => sum + parseFloat(day.conversionRate), 0) / displayAnalytics.length || 0;

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-text-secondary">Detailed insights into your tip performance and optimization opportunities</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-text-secondary">Total Earnings (7d)</div>
              <div className="text-xs text-success mt-1">+12% vs last week</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-start mb-1">{totalTips}</div>
              <div className="text-sm text-text-secondary">Total Tips (7d)</div>
              <div className="text-xs text-success mt-1">+8% vs last week</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-end mb-1">${(totalEarnings / totalTips).toFixed(2)}</div>
              <div className="text-sm text-text-secondary">Avg Tip Size</div>
              <div className="text-xs text-success mt-1">+5% vs last week</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-1">{avgConversion.toFixed(1)}%</div>
              <div className="text-sm text-text-secondary">Conversion Rate</div>
              <div className="text-xs text-success mt-1">+3% vs last week</div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Earnings Chart */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Daily Earnings</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Bar dataKey="amount" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Conversion Rate Trend */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Conversion Rate Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="conversion" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods Distribution */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Payment Methods</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {paymentMethodData.map((method) => (
                <div key={method.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }}></div>
                  <span className="text-sm text-text-secondary">{method.name} ({method.value}%)</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Optimization Recommendations */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Optimization Insights</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-green-400/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-text-primary">Peak Performance Hours</span>
                </div>
                <p className="text-sm text-text-secondary">Your conversion rate is 15% higher between 2-4 PM. Consider promoting your QR code during lunch rush.</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-400/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-text-primary">Payment Method Impact</span>
                </div>
                <p className="text-sm text-text-secondary">Stripe users tip 23% higher on average. Consider highlighting card payment option first.</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-400/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold text-text-primary">Weekly Growth</span>
                </div>
                <p className="text-sm text-text-secondary">You're on track to earn ${((totalEarnings / 7) * 30).toFixed(0)} this month. That's a 12% increase!</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}