import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  Calendar,
  Download,
  Settings,
  Crown,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/glass-card";

// Sample business metrics data
const businessMetrics = {
  totalRevenue: 52847.32,
  monthlyGrowth: 24.7,
  activeWorkers: 127,
  avgTipIncrease: 312,
  platformFee: 2.9,
  totalTransactions: 8429
};

const recentTransactions = [
  { worker: "Sarah Chen", amount: 45.50, method: "Stripe", time: "2 min ago" },
  { worker: "Marcus Rivera", amount: 23.75, method: "Venmo", time: "5 min ago" },
  { worker: "Aisha Patel", amount: 67.25, method: "Cash App", time: "8 min ago" },
  { worker: "David Kim", amount: 34.00, method: "Zelle", time: "12 min ago" },
  { worker: "Emma Rodriguez", amount: 28.50, method: "Stripe", time: "15 min ago" }
];

const topWorkers = [
  { name: "Sarah Chen", location: "Downtown Café", earnings: 1247.50, growth: 45.2 },
  { name: "Marcus Rivera", location: "Hotel Lobby", earnings: 1156.25, growth: 38.7 },
  { name: "Aisha Patel", location: "Restaurant", earnings: 1089.75, growth: 42.1 },
  { name: "David Kim", location: "Bar & Grill", earnings: 967.50, growth: 29.8 },
  { name: "Emma Rodriguez", location: "Coffee Shop", earnings: 845.25, growth: 52.3 }
];

export default function BusinessDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Dashboard</h1>
            <p className="text-gray-300">Monitor your TipVault platform performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Download size={16} className="mr-2" />
              Export Data
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${businessMetrics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-400 mt-1">
                  +{businessMetrics.monthlyGrowth}% from last month
                </p>
              </div>
              <DollarSign size={24} className="text-green-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Active Workers</p>
                <p className="text-2xl font-bold text-white">{businessMetrics.activeWorkers}</p>
                <p className="text-xs text-blue-400 mt-1">
                  12 new this week
                </p>
              </div>
              <Users size={24} className="text-blue-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Avg Tip Increase</p>
                <p className="text-2xl font-bold text-white">{businessMetrics.avgTipIncrease}%</p>
                <p className="text-xs text-purple-400 mt-1">
                  vs traditional methods
                </p>
              </div>
              <TrendingUp size={24} className="text-purple-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Platform Fees</p>
                <p className="text-2xl font-bold text-white">{businessMetrics.platformFee}%</p>
                <p className="text-xs text-yellow-400 mt-1">
                  Industry-leading low rate
                </p>
              </div>
              <Target size={24} className="text-yellow-400" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-gray-300" />
                    <span className="text-sm text-gray-300">Monthly View</span>
                  </div>
                </div>
                
                {/* Placeholder for revenue chart */}
                <div className="h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp size={48} className="text-blue-400 mx-auto" />
                    <p className="text-white font-medium">Revenue Chart</p>
                    <p className="text-sm text-gray-300">Integration with Recharts coming soon</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Top Performing Workers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Top Performing Workers</h3>
                
                <div className="space-y-4">
                  {topWorkers.map((worker, index) => (
                    <div key={worker.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{worker.name}</p>
                          <p className="text-sm text-gray-300">{worker.location}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-white">${worker.earnings}</p>
                        <p className="text-sm text-green-400">+{worker.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column - Recent Activity and Quick Actions */}
          <div className="space-y-6">
            
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
                
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white text-sm">{transaction.worker}</p>
                        <p className="text-xs text-gray-300">{transaction.method} • {transaction.time}</p>
                      </div>
                      <p className="font-semibold text-green-400">+${transaction.amount}</p>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4 bg-white/10 border border-white/20 text-white hover:bg-white/20">
                  View All Transactions
                </Button>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Crown size={16} className="mr-2" />
                    Upgrade to Pro
                  </Button>
                  
                  <Button className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    <Users size={16} className="mr-2" />
                    Invite Workers
                  </Button>
                  
                  <Button className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    <Settings size={16} className="mr-2" />
                    Platform Settings
                  </Button>
                  
                  <Button className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    <Zap size={16} className="mr-2" />
                    Marketing Tools
                  </Button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Growth Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Growth Tips</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-400/20">
                    <p className="text-sm font-medium text-blue-400 mb-1">Optimize Conversion</p>
                    <p className="text-xs text-gray-300">
                      Workers with custom QR codes see 45% more tips. Enable QR generation for your team.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-400/20">
                    <p className="text-sm font-medium text-purple-400 mb-1">Expand Payment Options</p>
                    <p className="text-xs text-gray-300">
                      Adding Zelle increased average tips by 28%. Consider enabling more payment methods.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}