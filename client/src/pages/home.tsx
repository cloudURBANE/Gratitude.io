import React from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  return (
    <PageContainer maxWidth="max-w-4xl" className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Hero Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles size={32} className="text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            TipVault
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The viral tipping platform that transforms service workers into money-earning powerhouses
          </p>
          
          <div className="text-lg font-medium text-foreground">
            💰 <span className="text-green-600 font-bold">300% earnings boost</span> through AI optimization
          </div>
        </div>

        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto"
        >
          <h3 className="text-lg font-semibold mb-4">Try the Demo</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Experience our revolutionary Hold-to-Tip gesture and Smart Dock payment system
          </p>
          
          <Link href="/u/demo">
            <Button size="lg" className="w-full">
              <Zap size={20} className="mr-2" />
              View Demo Tip Page
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <TrendingUp size={32} className="text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">AI-Powered Optimization</h4>
            <p className="text-sm text-muted-foreground">
              Smart tip amount recommendations that boost earnings by 300%
            </p>
          </div>
          
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <Zap size={32} className="text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Hold-to-Tip Gesture</h4>
            <p className="text-sm text-muted-foreground">
              Revolutionary interface with haptic feedback and liquid animations
            </p>
          </div>
          
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <Users size={32} className="text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Smart Payment Dock</h4>
            <p className="text-sm text-muted-foreground">
              Adaptive wallet selection: Venmo, Cash App, Zelle, Stripe
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-bold">Ready to Transform Your Tips?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}