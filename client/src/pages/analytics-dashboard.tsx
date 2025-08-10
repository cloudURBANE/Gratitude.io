import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, TrendingUp, Users, Target, Calendar, Clock,
  Smartphone, QrCode, Star, Award, Zap, ArrowUp, ArrowDown,
  Eye, ThumbsUp, Share2, Download, Filter, RefreshCw
} from 'lucide-react';

// Mock data for demonstration - replace with real API calls
const mockEarningsData = [
  { date: '2025-01-01', earnings: 45.50, tips: 8, avgTip: 5.69 },
  { date: '2025-01-02', earnings: 67.25, tips: 12, avgTip: 5.60 },
  { date: '2025-01-03', earnings: 89.75, tips: 15, avgTip: 5.98 },
  { date: '2025-01-04', earnings: 134.20, tips: 22, avgTip: 6.10 },
  { date: '2025-01-05', earnings: 156.80, tips: 28, avgTip: 5.60 },
  { date: '2025-01-06', earnings: 201.45, tips: 35, avgTip: 5.75 },
  { date: '2025-01-07', earnings: 234.90, tips: 41, avgTip: 5.73 },
];

const mockTipMethodData = [
  { method: 'Venmo', value: 45, color: '#8B5CF6' },
  { method: 'Cash App', value: 30, color: '#06D6A0' },
  { method: 'Stripe', value: 15, color: '#EF4444' },
  { method: 'Zelle', value: 10, color: '#F59E0B' },
];

const mockHourlyData = [
  { hour: '6 AM', tips: 2, earnings: 12.50 },
  { hour: '8 AM', tips: 5, earnings: 28.75 },
  { hour: '10 AM', tips: 8, earnings: 45.20 },
  { hour: '12 PM', tips: 15, earnings: 89.50 },
  { hour: '2 PM', tips: 18, earnings: 102.25 },
  { hour: '4 PM', tips: 12, earnings: 67.80 },
  { hour: '6 PM', tips: 22, earnings: 134.90 },
  { hour: '8 PM', tips: 28, earnings: 167.45 },
  { hour: '10 PM', tips: 19, earnings: 98.75 },
];

// Animated Money Flow SVG Component
const MoneyFlowSVG = ({ animate = true }: { animate?: boolean }) => (
  <motion.svg
    width="100"
    height="60"
    viewBox="0 0 100 60"
    className="absolute top-4 right-4 opacity-20"
    animate={animate ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <defs>
      <linearGradient id="moneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#06D6A0" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    <motion.path
      d="M20 30 Q50 10 80 30 Q50 50 20 30"
      fill="none"
      stroke="url(#moneyGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle
      cx="50"
      cy="30"
      r="8"
      fill="url(#moneyGradient)"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <text x="50" y="34" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
  </motion.svg>
);

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  subtitle 
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend?: 'up' | 'down';
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
      <MoneyFlowSVG />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg">
              <Icon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">{title}</p>
              <h3 className="text-2xl font-bold text-white">{value}</h3>
              {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: $${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock query - replace with real API call
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/analytics', timeRange],
    queryFn: () => Promise.resolve({
      totalEarnings: 1234.56,
      totalTips: 156,
      avgTip: 7.91,
      conversionRate: 24.5,
      topHour: '8 PM',
      topDay: 'Friday',
      weeklyGrowth: 18.2
    }),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-emerald-900/20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-emerald-900/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/70">Track your tip performance and earnings insights</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Earnings"
            value="$1,234.56"
            change="+18.2%"
            icon={DollarSign}
            subtitle="This week"
          />
          <MetricCard
            title="Total Tips"
            value="156"
            change="+12.5%"
            icon={Target}
            subtitle="7 days"
          />
          <MetricCard
            title="Avg Tip Amount"
            value="$7.91"
            change="+5.3%"
            icon={TrendingUp}
            subtitle="Per tip"
          />
          <MetricCard
            title="Conversion Rate"
            value="24.5%"
            change="+3.1%"
            icon={Award}
            subtitle="QR to tip"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="earnings" className="text-white data-[state=active]:bg-emerald-500/20">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="methods" className="text-white data-[state=active]:bg-emerald-500/20">
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="hourly" className="text-white data-[state=active]:bg-emerald-500/20">
              Hourly Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-white data-[state=active]:bg-emerald-500/20">
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Earnings Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockEarningsData}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-emerald-400" />
                    <span>Payment Method Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockTipMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockTipMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Payment Method Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTipMethodData.map((method, index) => (
                    <motion.div
                      key={method.method}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="text-white font-medium">{method.method}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 text-white">
                        {method.value}%
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <span>Hourly Tip Patterns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-emerald-400" />
                    <span>Performance Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Best Performing Hour</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400">8 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Highest Tip Day</span>
                    <Badge className="bg-purple-500/20 text-purple-400">Friday</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/70">Weekly Growth</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400">+18.2%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Filter className="h-4 w-4 mr-2" />
                    Custom Filter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}