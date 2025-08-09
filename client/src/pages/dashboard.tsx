import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import ReviewStats from "@/components/review-stats";

interface Worker {
  id: string;
  name: string;
  role: string;
  location: string;
  handle: string;
  avatar_url?: string;
  todayStats: {
    totalTips: number;
    totalAmount: string;
    avgAmount: string;
  };
}

interface Analytics {
  date: string;
  totalTips: number;
  totalAmount: string;
  avgTipAmount: string;
  qrScans: number;
  conversionRate: string;
}

interface Tip {
  id: string;
  amount: string;
  paymentMethod: string;
  customerName: string;
  note: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { handle } = useParams<{ handle: string }>();

  const { data: worker, isLoading } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle,
  });

  // Demo data for when handle is 'demo'
  const demoWorker: Worker = {
    id: 'demo-id',
    name: 'Jordan M.',
    role: 'Barista & Shift Lead',
    location: 'Seattle, WA',
    handle: 'demo',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    todayStats: {
      totalTips: 8,
      totalAmount: '94.00',
      avgAmount: '11.75',
    },
  };

  const displayWorker = handle === 'demo' ? demoWorker : worker;

  const { data: analytics } = useQuery<Analytics[]>({
    queryKey: ["/api/workers", worker?.id, "analytics"],
    enabled: !!worker?.id,
  });

  const { data: recentTips } = useQuery<Tip[]>({
    queryKey: ["/api/workers", worker?.id, "tips"],
    enabled: !!worker?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!displayWorker) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Dashboard Not Found</h1>
          <p className="text-text-secondary mb-6">Worker dashboard not available.</p>
        </GlassCard>
      </div>
    );
  }

  const totalEarnings = analytics?.reduce((sum, day) => sum + parseFloat(day.totalAmount || '0'), 0) || 0;
  const avgConversion = analytics && analytics.length > 0 
    ? analytics.reduce((sum, day) => sum + parseFloat(day.conversionRate || '0'), 0) / analytics.length 
    : 15.4;
  const totalScans = analytics?.reduce((sum, day) => sum + (day.qrScans || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={displayWorker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
                alt={displayWorker.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-glass-border" 
              />
              <div>
                <h1 className="text-3xl font-bold text-text-primary">{displayWorker.name}</h1>
                <p className="text-text-secondary">{displayWorker.role} • {displayWorker.location}</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <div className="flex gap-2">
              <Link href={`/u/${handle}`}>
                <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span className="text-sm">Tip Page</span>
                </button>
              </Link>
              
              <Link href={`/u/${handle}/analytics`}>
                <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span className="text-sm">Analytics</span>
                </button>
              </Link>
              
              <Link href={`/u/${handle}/qr`}>
                <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11a2 2 0 100-4m0 4a2 2 0 110 4m0-4v4m-6-11a2 2 0 00-4 0v4a2 2 0 004 0V9m0-4a2 2 0 014 0v1m-4-1a2 2 0 104 0"></path>
                  </svg>
                  <span className="text-sm">QR Codes</span>
                </button>
              </Link>
              
              <Link href={`/u/${handle}/settings`}>
                <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-sm">Settings</span>
                </button>
              </Link>
            </div>
          </div>
          
          <div className="flex gap-4">
            <GradientButton className="px-6 py-2">
              Share QR Code
            </GradientButton>
            <button className="px-6 py-2 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Today's Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-start mb-1">{displayWorker.todayStats.totalTips}</div>
              <div className="text-sm text-text-secondary">Tips Today</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">${displayWorker.todayStats.totalAmount}</div>
              <div className="text-sm text-text-secondary">Today's Earnings</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-end mb-1">${displayWorker.todayStats.avgAmount}</div>
              <div className="text-sm text-text-secondary">Avg Tip Size</div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-1">{avgConversion.toFixed(1)}%</div>
              <div className="text-sm text-text-secondary">Conversion Rate</div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Stats */}
          <ReviewStats workerId={displayWorker.id} />

          {/* Earnings Optimization Insights */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">💡 Earning Optimization Tips</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-accent-start rounded-full mt-2"></div>
                <div>
                  <div className="text-text-primary font-medium mb-1">Peak Hours Analysis</div>
                  <div className="text-sm text-text-secondary">Your best earning hours are 2-4 PM and 7-9 PM. Consider optimizing your QR placement during these times.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-accent-end rounded-full mt-2"></div>
                <div>
                  <div className="text-text-primary font-medium mb-1">Payment Method Optimization</div>
                  <div className="text-sm text-text-secondary">Customers tip 23% higher on average when using Stripe. Consider promoting card payments.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div>
                  <div className="text-text-primary font-medium mb-1">QR Code Placement</div>
                  <div className="text-sm text-text-secondary">Your {avgConversion.toFixed(1)}% conversion rate can be improved. Try placing QR codes at eye level near the register.</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Performance Analytics */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">📈 30-Day Performance</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Earnings</span>
                <span className="text-2xl font-bold text-text-primary">${totalEarnings.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">QR Code Scans</span>
                <span className="text-xl font-semibold text-accent-start">{totalScans}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Avg Conversion Rate</span>
                <span className="text-xl font-semibold text-success">{avgConversion.toFixed(1)}%</span>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-accent-start to-accent-end rounded-lg">
                <div className="text-white font-semibold mb-1">Earning Potential</div>
                <div className="text-sm text-white opacity-90">
                  With optimization, you could earn an additional ${(totalEarnings * 0.3).toFixed(2)} per month!
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Tips */}
        <GlassCard className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">💰 Recent Tips</h2>
          
          <div className="space-y-3">
            {recentTips?.slice(0, 8).map((tip) => (
              <div key={tip.id} className="flex items-center justify-between p-3 bg-glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <div>
                    <div className="text-text-primary font-medium">${tip.amount}</div>
                    <div className="text-xs text-text-secondary">
                      {tip.customerName || 'Anonymous'} • {tip.paymentMethod.charAt(0).toUpperCase() + tip.paymentMethod.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  {new Date(tip.createdAt).toLocaleTimeString()}
                </div>
              </div>
            )) || (
              <div className="text-center text-text-secondary py-8">
                No tips yet. Share your QR code to start earning!
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}