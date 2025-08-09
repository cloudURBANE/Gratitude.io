import { motion } from "framer-motion";
import { Check, Star, Zap, TrendingUp, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30">
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
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
            >
              <TrendingUp size={24} className="text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-200 bg-clip-text text-transparent leading-tight">
              Boost Your Earnings
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your goals. Start free and upgrade when you're ready to maximize your tip potential.
            </p>
          </div>

          {/* ROI Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <GlassCard className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">300%</div>
              <div className="text-sm text-gray-300">Average Tip Increase</div>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2,847</div>
              <div className="text-sm text-gray-300">Extra Monthly Income</div>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">72%</div>
              <div className="text-sm text-gray-300">Customer Retention Rate</div>
            </GlassCard>
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
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown size={14} />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <GlassCard className={`p-8 h-full ${tier.popular ? 'ring-2 ring-green-400/50' : ''}`}>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center gap-2">
                          {tier.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">{tier.originalPrice}</span>
                          )}
                          <span className="text-4xl font-bold text-white">{tier.price}</span>
                          <span className="text-gray-300">/{tier.period}</span>
                        </div>
                        {tier.savings && (
                          <div className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                            <Sparkles size={12} />
                            {tier.savings}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mt-2">{tier.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check size={16} className="text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {tier.limitations?.map((limitation) => (
                        <div key={limitation} className="flex items-center gap-3 opacity-60">
                          <div className="w-4 h-4 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4">
                      <Button 
                        className={`w-full ${tier.popular 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/20'
                        } text-white font-semibold`}
                      >
                        {tier.cta}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-white">Enterprise Solutions Available</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-blue-400" />
                  <h4 className="font-semibold text-white">Restaurant Chains</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Multi-location management, staff analytics, and centralized billing for restaurant groups.
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </GlassCard>
              
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star size={24} className="text-yellow-400" />
                  <h4 className="font-semibold text-white">Hospitality Groups</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Hotel, resort, and service company solutions with custom integrations and white-label options.
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </GlassCard>
            </div>
          </motion.div>

          {/* Money Back Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full">
              <Check size={16} />
              <span className="text-sm font-medium">30-day money-back guarantee</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
            
            <div className="pt-4">
              <Link href="/u/demo">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Try Demo First
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}