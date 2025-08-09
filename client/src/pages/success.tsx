import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Calendar,
  CreditCard,
  Mail,
  Settings,
  BarChart3
} from "lucide-react";

interface SubscriptionData {
  plan: string;
  email: string;
  name: string;
  startDate: string;
  status: string;
}

const nextSteps = [
  {
    icon: Settings,
    title: "Set Up Your Profile",
    description: "Complete your worker profile with photo, role, and payment methods",
    action: "Complete Profile",
    href: "/profile-settings"
  },
  {
    icon: CreditCard,
    title: "Create Your First Tip Page",
    description: "Generate your unique tip page that customers can scan or visit",
    action: "Create Tip Page",
    href: "/dashboard"
  },
  {
    icon: BarChart3,
    title: "Track Your Earnings",
    description: "Monitor your tip performance and optimize for peak hours",
    action: "View Analytics",
    href: "/analytics"
  }
];

export default function Success() {
  const [, setLocation] = useLocation();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Get subscription data
    try {
      const data = localStorage.getItem('tipvault-subscription');
      if (data) {
        setSubscription(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Failed to load subscription data');
    }

    // Auto-advance steps
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % nextSteps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getPlanDisplayName = (plan: string) => {
    return plan === 'pro_monthly' ? 'Pro Monthly' : 
           plan === 'pro_yearly' ? 'Pro Yearly' : 'Pro';
  };

  const getTrialEndDate = () => {
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return endDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to TipVault Pro! 🎉
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your 7-day free trial has started. You now have access to all Pro features 
              to maximize your tip earnings.
            </p>
          </div>

          {/* Trial Info */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 border border-green-200 bg-green-50 max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-green-600 text-white px-3 py-1">
                      <Sparkles size={12} className="mr-1" />
                      {getPlanDisplayName(subscription.plan)}
                    </Badge>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-gray-900">Free Trial Active</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>Trial ends {getTrialEndDate()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{subscription.email}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Next Steps */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Let's Get You Started
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className={`p-6 border transition-all duration-300 h-full ${
                    currentStep === index 
                      ? 'border-blue-600 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        currentStep === index 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <step.icon size={24} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      
                      <Link href={step.href}>
                        <Button
                          variant={currentStep === index ? "default" : "outline"}
                          className={`w-full ${
                            currentStep === index 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : ''
                          }`}
                        >
                          {step.action}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900 rounded-2xl p-8 text-center"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Ready to Start Earning More?
                </h3>
                <p className="text-gray-300">
                  Skip the setup and dive right into your dashboard to see TipVault in action.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
                    Go to Dashboard
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                
                <Link href="/u/demo">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3"
                  >
                    Try Demo First
                  </Button>
                </Link>
              </div>

              <div className="text-gray-400 text-sm">
                🎯 Tip: Most users see their first tip increase within 24 hours
              </div>
            </div>
          </motion.div>

          {/* Support */}
          <div className="text-center space-y-4 pt-8 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900">Need Help Getting Started?</h4>
            <p className="text-gray-600">
              Our support team is here to help you maximize your earnings from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="mailto:support@tipvault.com" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support@tipvault.com
              </a>
              <span className="text-gray-400 hidden sm:block">•</span>
              <a 
                href="tel:+1-555-TIP-VAULT" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                1-555-TIP-VAULT
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}