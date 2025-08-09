import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto"
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              TipVault
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              The revolutionary tipping platform that boosts service worker earnings by 300%
            </p>
          </div>

          {/* Demo CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Experience the Future</h3>
              <p className="text-gray-300 mb-6 text-sm">
                Try our revolutionary Hold-to-Tip gesture and Smart Payment Dock
              </p>
              
              <Link href="/u/demo">
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                  <Zap size={20} className="mr-2" />
                  View Live Demo
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </GlassCard>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <GlassCard className="p-6 text-center">
              <TrendingUp size={32} className="text-green-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">AI-Powered Tips</h4>
              <p className="text-sm text-gray-300">
                Smart recommendations boost earnings by 300% through data-driven optimization
              </p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <Zap size={32} className="text-blue-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Hold-to-Tip</h4>
              <p className="text-sm text-gray-300">
                Revolutionary gesture interface with haptic feedback and liquid animations
              </p>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <Sparkles size={32} className="text-purple-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Smart Payments</h4>
              <p className="text-sm text-gray-300">
                Adaptive wallet selection: Venmo, Cash App, Zelle, and Stripe integration
              </p>
            </GlassCard>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white">Ready to Transform Your Tips?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                  Start Earning More
                </Button>
              </Link>
              <Link href="/business">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Business Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}