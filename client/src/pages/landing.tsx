import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  QrCode, 
  BarChart3,
  Star,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';

export default function Landing() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Integration',
      description: 'Generate custom QR codes for instant tip collection'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track earnings, peak hours, and customer insights'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Bank-level security with instant payment processing'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience on any device for customers and workers'
    }
  ];

  const handleGetStarted = () => {
    // Direct to signup for account creation
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen relative">
      {/* Neo-Glass Header */}
      <header className="neo-card sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="neo-btn w-12 h-12 p-0 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="text-2xl font-bold">TipVault</div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/login'}
              className="neo-btn"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => window.location.href = '/signup'}
              className="neo-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Neo-Glass Design */}
      <div className="relative overflow-hidden py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 scroll-reveal"
        >
          <Badge className="neo-btn mb-6 px-4 py-2">
            ✨ Professional Tip Management Platform
          </Badge>
          
          <h1 className="mb-6">
            TipVault
          </h1>
          
          <p className="text-xl md:text-2xl opacity-80 mb-8 max-w-3xl mx-auto leading-relaxed">
            The professional platform designed to optimize digital tipping for service workers through intelligent technology and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="neo-btn px-8 py-4 text-lg"
              onClick={handleGetStarted}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Start Earning Tips Now
              <motion.div
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="neo-btn px-8 py-4 text-lg opacity-80"
              onClick={() => window.location.href = '/pricing'}
            >
              View Pricing
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Bank-level Security
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Trusted by 1000+ Workers
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              99.9% Uptime
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
              <feature.icon className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center py-16"
      >
        <Card className="p-8 bg-gradient-to-r from-purple-600/20 to-teal-600/20 backdrop-blur-sm border-purple-500/30 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Tips?
          </h2>
          <p className="text-gray-300 mb-6">
            Join thousands of service workers who have transformed their earning potential with TipVault's professional platform.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-4"
            onClick={handleGetStarted}
          >
            Create Your Tip Page
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}