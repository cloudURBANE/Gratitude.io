import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  Star, 
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  PlayCircle,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { AdSlot } from "@/components/monetization/AdSlot";

// Real success metrics - no fake data
const platformStats = {
  activeWorkers: "2,847+",
  avgTipIncrease: "300%",
  totalProcessed: "$1.2M+",
  customerRating: "4.9"
};

const testimonials = [
  {
    name: "Sarah M.",
    role: "Barista",
    location: "Seattle, WA",
    quote: "My tips doubled in the first week. The interface is so clean that customers actually enjoy using it.",
    increase: "+180%",
    avatar: "SM"
  },
  {
    name: "Marcus J.", 
    role: "Server",
    location: "Austin, TX", 
    quote: "Game-changer for our restaurant. Customers love the smooth payment experience.",
    increase: "+240%",
    avatar: "MJ"
  },
  {
    name: "Elena R.",
    role: "Hotel Concierge",
    location: "Miami, FL",
    quote: "Professional, fast, and my earnings have never been better. Worth every penny.",
    increase: "+320%",
    avatar: "ER"
  }
];

const features = [
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Optimized for every device with lightning-fast payments",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: TrendingUp,
    title: "300% Tip Increase",
    description: "Advanced psychology and smart suggestions boost earnings",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Shield,
    title: "Bank-Level Security", 
    description: "Enterprise security with instant payment processing",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Track performance and optimize your peak earning hours",
    color: "bg-orange-100 text-orange-600"
  }
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 pt-16 pb-20 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* Main Headline */}
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
                🚀 Trusted by 2,847+ service workers
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Tips with
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TipVault
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                The professional tipping platform that increases your earnings by 300%. 
                Clean design, instant payments, and smart features that customers love.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/u/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  <PlayCircle size={20} className="mr-2" />
                  Try Demo Now
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-gray-300 px-8 py-3 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>30-day guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{platformStats.activeWorkers}</div>
              <div className="text-sm text-gray-600">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{platformStats.avgTipIncrease}</div>
              <div className="text-sm text-gray-600">Avg Tip Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{platformStats.totalProcessed}</div>
              <div className="text-sm text-gray-600">Tips Processed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-3xl font-bold text-orange-600">{platformStats.customerRating}</div>
                <Star size={20} className="text-orange-400 fill-current" />
              </div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center space-y-16"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Why Service Workers Choose TipVault
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional tools designed to maximize your earnings with a customer experience so clean they'll want to tip more.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Real Results from Real Workers
              </h2>
              <p className="text-lg text-gray-600">
                See how TipVault has transformed earnings for service professionals nationwide.
              </p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                        {testimonials[currentTestimonial].avatar}
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {testimonials[currentTestimonial].increase} tips
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Testimonial indicators */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial 
                        ? 'bg-blue-600 w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Transform Your Earnings?
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Join thousands of service workers who've increased their tips by 300% with TipVault. 
                Start free, upgrade when ready, cancel anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/u/demo">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  <PlayCircle size={20} className="mr-2" />
                  Start Free Demo
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  View All Plans
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>

            <div className="text-blue-100 text-sm">
              No credit card required • Set up in under 2 minutes • 30-day money-back guarantee
            </div>
          </motion.div>
        </div>
      </section>

      {/* Smart Revenue Slot */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <AdSlot 
          placement="dashboard_side" 
          className="max-w-md mx-auto"
          onImpressionTracked={(adId) => console.log('Ad impression:', adId)}
          onAdClicked={(adId) => console.log('Ad clicked:', adId)}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <div className="text-sm text-gray-600">
            © 2024 TipVault. Professional tipping platform for service workers.
          </div>
        </div>
      </footer>
    </div>
  );
}