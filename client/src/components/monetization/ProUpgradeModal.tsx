import { useState } from "react";
import { motion } from "framer-motion";
import { X, Crown, Check, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/glass-card";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: "monthly" | "yearly") => void;
  trigger?: "tip_limit" | "analytics_limit" | "customization_limit" | "ads_annoyance";
}

const triggerMessages = {
  tip_limit: "Ready to create more tip pages? Upgrade to Pro for unlimited pages and advanced features.",
  analytics_limit: "Unlock detailed analytics to optimize your earnings and understand customer patterns.",
  customization_limit: "Make your tip page stand out with custom branding and professional themes.",
  ads_annoyance: "Focus on what matters most - upgrade to Pro for a distraction-free experience."
};

const proFeatures = [
  "Unlimited tip pages",
  "Advanced analytics & insights", 
  "Custom branding & themes",
  "Ad-free experience",
  "Priority support",
  "QR code generator",
  "Review management tools",
  "Team splitting features",
  "Custom domains",
  "Wallet pass generation"
];

export default function ProUpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  trigger = "tip_limit" 
}: ProUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-white rounded-2xl p-8 relative shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto"
            >
              <Crown size={24} className="text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Unlock TipVault Pro
            </h2>
            
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
              {triggerMessages[trigger]}
            </p>
          </div>

          {/* Plan Selection */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 text-center">Choose Your Plan</h3>
            
            <div className="grid gap-4">
              {/* Monthly Plan */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === "monthly" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setSelectedPlan("monthly")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Pro Monthly</h4>
                    <p className="text-gray-600 text-sm">Perfect for getting started</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">$4.99</div>
                    <div className="text-gray-600 text-sm">per month</div>
                  </div>
                </div>
              </motion.div>

              {/* Yearly Plan */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                  selectedPlan === "yearly" 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setSelectedPlan("yearly")}
              >
                {/* Best Value Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles size={10} />
                  Save 42%
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Pro Yearly</h4>
                    <p className="text-gray-600 text-sm">Best value - 2 months free!</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-400 line-through">$59.88</span>
                      <div className="text-2xl font-bold text-gray-900">$35</div>
                    </div>
                    <div className="text-gray-600 text-sm">per year</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Everything you get with Pro:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {proFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
            >
              <Crown size={20} className="mr-2" />
              Upgrade to Pro {selectedPlan === "yearly" ? "Yearly" : "Monthly"}
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm">
                7-day free trial • Cancel anytime • 30-day money-back guarantee
              </p>
              
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}