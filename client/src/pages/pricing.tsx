import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3, 
  Users,
  Star,
  Crown,
  Sparkles,
  TrendingUp
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    popular: false,
    features: [
      "1 tip page",
      "Basic payment methods",
      "Mobile-optimized design",
      "Email support",
      "Community access"
    ],
    limitations: [
      "TipVault branding",
      "Basic analytics only",
      "Standard QR codes"
    ],
    cta: "Start Free",
    highlight: false
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "month",
    yearlyPrice: "$35",
    yearlyPeriod: "year",
    description: "Maximize your earning potential",
    popular: true,
    features: [
      "Unlimited tip pages",
      "All payment methods",
      "Custom branding",
      "Advanced analytics",
      "Priority support",
      "Snake game monetization",
      "QR code customization",
      "Performance insights",
      "Earnings optimization",
      "Review management tools"
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    highlight: true,
    savings: "Save $25/year"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For teams and organizations",
    popular: false,
    features: [
      "Everything in Pro",
      "Multi-location support",
      "Team management",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "White-label options",
      "Advanced reporting",
      "Bulk QR generation",
      "Staff training"
    ],
    limitations: [],
    cta: "Contact Sales",
    highlight: false
  }
];

const faq = [
  {
    question: "How does the free plan work?",
    answer: "Start completely free with 1 tip page and basic features. No credit card required. Upgrade anytime when you need more features."
  },
  {
    question: "What payment methods are supported?",
    answer: "All plans support Stripe, Venmo, Cash App, and Zelle. Pro includes advanced payment optimizations and fail-safe app linking."
  },
  {
    question: "How much can I really increase my tips?",
    answer: "Our users average 300% increase in tips within the first month. Clean design and smart psychology make customers want to tip more."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! Cancel your subscription anytime with no penalties. Your tip pages remain active until your current billing period ends."
  },
  {
    question: "Do you take a percentage of tips?",
    answer: "No! We never take a cut of your tips. You keep 100% minus standard payment processing fees (2.9% for cards, free for app-to-app)."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees. No hidden costs. Just transparent monthly pricing that helps you earn more than it costs."
  }
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    
    if (planName === 'Free') {
      // Direct to signup
      window.location.href = '/u/demo';
    } else if (planName === 'Pro') {
      // Direct to checkout with selected billing
      const checkoutUrl = billingPeriod === 'yearly' 
        ? '/checkout?plan=pro_yearly&amount=35'
        : '/checkout?plan=pro_monthly&amount=4.99';
      window.location.href = checkoutUrl;
    } else {
      // Enterprise - contact form
      window.location.href = 'mailto:sales@tipvault.com?subject=Enterprise Inquiry';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2">
              💰 Average 300% tip increase
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Choose Your Plan
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional tipping that pays for itself. Start free, upgrade when ready, 
              cancel anytime. Every plan keeps 100% of your tips.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yearly
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Save 40%
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.highlight ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                <Card className={`h-full p-6 ${
                  plan.highlight 
                    ? 'border-2 border-blue-600 shadow-lg' 
                    : 'border border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Crown size={14} className="mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Plan Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      
                      <div className="mt-4">
                        {plan.name === 'Pro' && billingPeriod === 'yearly' ? (
                          <div>
                            <div className="text-3xl font-bold text-gray-900">
                              ${plan.yearlyPrice}
                              <span className="text-lg font-normal text-gray-600">/{plan.yearlyPeriod}</span>
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              $59.88/year monthly
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              {plan.savings}
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-gray-900">
                            {plan.price}
                            {plan.period !== 'contact us' && (
                              <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start gap-3 opacity-60">
                          <div className="w-4 h-4 border border-gray-300 rounded-full mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => handlePlanSelect(plan.name)}
                      className={`w-full ${
                        plan.highlight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : plan.name === 'Enterprise'
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                      }`}
                      disabled={selectedPlan === plan.name}
                    >
                      {selectedPlan === plan.name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </Button>

                    {plan.name === 'Pro' && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">
                          7-day free trial • No credit card required
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Why Service Workers Choose TipVault
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional tools that pay for themselves within days, not months.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">300% Tip Increase</h3>
                <p className="text-gray-600">
                  Advanced psychology and clean design make customers want to tip more. 
                  Average user sees 300% increase in first month.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Keep 100% of Tips</h3>
                <p className="text-gray-600">
                  We never take a percentage. You keep every penny minus standard 
                  payment processing (2.9% cards, free app-to-app).
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={32} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Pays for Itself</h3>
                <p className="text-gray-600">
                  Pro users typically earn the subscription cost back in 1-2 tips. 
                  ROI averages 2,400% in the first month.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to know about TipVault pricing and features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {faq.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Ready to Transform Your Earnings?
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Join thousands of service workers earning 300% more with TipVault. 
                Start free, upgrade when ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/u/demo">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  Start Free Now
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => handlePlanSelect('Pro')}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
              >
                Upgrade to Pro
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>

            <div className="text-blue-100 text-sm">
              No credit card required • 7-day free trial • Cancel anytime
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}