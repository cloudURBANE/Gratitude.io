import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  DollarSign, QrCode, BarChart3, Settings, ArrowRight, Sparkles, 
  TrendingUp, Target, Users, Crown, Star, Wallet, CheckCircle,
  Eye, Link as LinkIcon, Copy
} from "lucide-react";
import { Link } from 'wouter';

export default function WelcomeDashboard() {
  const { user } = useAuth();

  // Check if user has completed profile setup
  const hasProfile = user?.handle && user?.workplace;

  const nextSteps = [
    {
      title: "Complete Your Profile",
      description: "Set up your professional tip page with payment methods",
      icon: DollarSign,
      action: () => window.location.href = '/profile-setup',
      button: "Setup Profile",
      completed: hasProfile,
      priority: 1
    },
    {
      title: "Generate QR Code", 
      description: "Get your QR code for instant tip collection",
      icon: QrCode,
      action: () => window.location.href = '/qr',
      button: "Get QR Code",
      completed: false,
      priority: 2
    },
    {
      title: "View Analytics",
      description: "Track your earnings and optimize your tips",
      icon: BarChart3,
      action: () => window.location.href = '/analytics',
      button: "View Stats", 
      completed: false,
      priority: 3
    }
  ];

  return (
    <div className="min-h-screen text-white relative">
      {/* Neo-Glass Header with View Transitions */}
      <header className="neo-card sticky top-0 z-50 border-b border-white/5" style={{ animationName: 'neo-enter' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neo-btn w-12 h-12 p-0 flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  TipVault
                </h1>
                <p className="text-xs opacity-70">Professional Tip Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="neo-btn px-3 py-1 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Free Plan
              </Badge>
              <Link href="/account-settings">
                <Button variant="outline" size="sm" className="neo-btn text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome to TipVault, {user?.firstName || 'Friend'}!
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-6">
              You're all set! Let's get your professional tip page earning money.
            </p>
            
            {/* Status Badges */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Account Created</span>
              </div>
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                hasProfile 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-orange-500/10 border border-orange-500/30'
              }`}>
                {hasProfile ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Profile Complete</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium">Profile Needed</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl blur-lg" />
            <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">$0.00</h3>
                <p className="text-white/60 text-sm">Total Earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg" />
            <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">0</h3>
                <p className="text-white/60 text-sm">QR Scans</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-green-500/10 rounded-2xl blur-lg" />
            <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">0</h3>
                <p className="text-white/60 text-sm">Customers</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-lg" />
            <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">$0.00</h3>
                <p className="text-white/60 text-sm">Avg Tip</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Current Tip Page Status */}
        {hasProfile && user?.handle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
                      <Star className="w-6 h-6 text-green-400" />
                    </div>
                    Your Live Tip Page
                    <Badge className="ml-auto bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                      <Eye className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Your professional tip collection page is ready to earn</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 font-medium">tipvault.com/u/{user.handle}</p>
                        <p className="text-white/50 text-sm">Share this link to start receiving tips</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`https://tipvault.com/u/${user.handle}`)}
                          className="border-white/20 text-white/80 hover:bg-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Link href={`/u/${user.handle}`}>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-green-400" />
            Get Started in 3 Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-2xl blur-lg ${
                      step.completed 
                        ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20' 
                        : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                    }`} />
                    <Card className={`relative backdrop-blur-xl border rounded-2xl overflow-hidden h-full ${
                      step.completed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-black/40 border-white/20'
                    }`}>
                      {step.completed && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />
                      )}
                      
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              step.completed 
                                ? 'bg-gradient-to-r from-green-500/30 to-blue-500/30' 
                                : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                            }`}>
                              <StepIcon className={`w-5 h-5 ${
                                step.completed ? 'text-green-400' : 'text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">{step.title}</CardTitle>
                              <span className={`text-sm ${
                                step.completed ? 'text-green-400' : 'text-blue-400'
                              }`}>
                                Step {step.priority}
                              </span>
                            </div>
                          </div>
                          {step.completed && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-white/70 mb-4">{step.description}</p>
                        <Button 
                          onClick={step.action}
                          disabled={step.completed}
                          className={`w-full ${
                            step.completed 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                          }`}
                        >
                          {step.completed ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {step.button}
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Earning Potential */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-blue-500/10 rounded-3xl blur-xl" />
            <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-green-500 to-blue-500" />
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Your Earning Potential
                    </span>
                  </h3>
                  <p className="text-white/70 mb-6">
                    TipVault service workers earn an average of $127 more per week than traditional tip methods
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                      <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">Multiple Payment Options</p>
                      <p className="text-xs text-white/70 mt-1">Accept tips via Venmo, Cash App, Zelle, and cards</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                      <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-400 font-semibold">Smart Analytics</p>
                      <p className="text-xs text-white/70 mt-1">Track peak hours and optimize your earnings</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-xl p-4">
                      <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-400 font-semibold">Professional Branding</p>
                      <p className="text-xs text-white/70 mt-1">Build customer relationships and repeat business</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}