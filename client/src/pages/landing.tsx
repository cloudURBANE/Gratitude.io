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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-teal-600/20 animate-pulse" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center py-20"
        >
          <Badge variant="secondary" className="mb-4 bg-purple-600/20 text-purple-200 border-purple-500/30">
            ✨ Professional Tip Management Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
            TipVault
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The professional platform designed to optimize digital tipping for service workers through intelligent technology and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-4 text-lg"
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
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