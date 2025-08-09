import { motion } from "framer-motion";
import { Check, Star, Zap, TrendingUp, Crown, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 tip page",
      "Basic analytics",
      "Standard payment methods",
      "TipVault branding",
      "Community support"
    ],
    limitations: [
      "Ad-supported",
      "Limited customization",
      "Basic features only"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "per month",
    description: "For serious service workers",
    features: [
      "Unlimited tip pages",
      "Advanced analytics & insights",
      "Custom branding",
      "Ad-free experience",
      "Priority support",
      "QR code generation",
      "Review management",
      "Team splitting",
      "Custom domains",
      "Wallet passes"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Pro Yearly",
    price: "$35",
    period: "per year",
    originalPrice: "$59.88",
    savings: "Save 42%",
    description: "Best value for power users",
    features: [
      "Everything in Pro",
      "2 months free",
      "Priority feature requests",
      "Advanced integrations",
      "White-label options"
    ],
    cta: "Get Pro Yearly",
    popular: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-xl">TipVault</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/business" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Business
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12"
        >
          {/* Header */}
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto"
            >
              <TrendingUp size={24} className="text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Simple, Fair Pricing
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and grow your tips. Upgrade when you're ready for advanced features. No hidden fees, just honest value.
            </p>
          </div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">300%</div>
                <div className="text-gray-600">Average tip increase</div>
                <div className="text-sm text-gray-500 mt-1">vs traditional methods</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">2.9%</div>
                <div className="text-gray-600">Processing fee</div>
                <div className="text-sm text-gray-500 mt-1">Industry-leading low rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">30 sec</div>
                <div className="text-gray-600">Setup time</div>
                <div className="text-sm text-gray-500 mt-1">Start earning immediately</div>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className={`bg-white rounded-2xl p-8 h-full shadow-lg border-2 ${tier.popular ? 'border-blue-600 relative' : 'border-gray-100'}`}>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center gap-2">
                          {tier.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">{tier.originalPrice}</span>
                          )}
                          <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                          <span className="text-gray-600">/{tier.period}</span>
                        </div>
                        {tier.savings && (
                          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <Sparkles size={12} />
                            {tier.savings}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{tier.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check size={16} className="text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {tier.limitations?.map((limitation) => (
                        <div key={limitation} className="flex items-center gap-3 opacity-60">
                          <div className="w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4">
                      <Button 
                        className={`w-full ${tier.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        } font-semibold`}
                      >
                        {tier.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enterprise Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Enterprise Solutions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Powerful tools for restaurant chains, hotels, and service companies. Scale your tipping operations with advanced analytics and management features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap size={20} className="text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Restaurant Chains</h4>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Multi-location management, staff analytics, and centralized billing for restaurant groups. Seamless integration with existing POS systems.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Contact Sales
                </Button>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star size={20} className="text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Hospitality Groups</h4>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Hotel, resort, and service company solutions with custom integrations, white-label options, and comprehensive reporting.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Trust & Security */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-gray-50 rounded-2xl p-8 text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                <Check size={14} />
                30-day money-back guarantee
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
                <Shield size={14} />
                Bank-level security
              </div>
            </div>
            
            <p className="text-gray-600 max-w-lg mx-auto">
              Join thousands of service workers who trust TipVault with their earnings. Start free, upgrade when ready, cancel anytime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/u/demo">
                <Button variant="outline" className="px-6">
                  Try Demo First
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}