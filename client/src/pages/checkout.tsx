import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft,
  Sparkles,
  Lock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/monetization/AdSlot";

const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  cardNumber: z.string().min(16, "Valid card number required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format required"),
  cvv: z.string().min(3, "CVV required"),
  billingZip: z.string().min(5, "ZIP code required")
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const planDetails = {
  pro_monthly: {
    name: "Pro Monthly",
    price: "$4.99",
    period: "month",
    features: ["Unlimited tip pages", "Custom branding", "Advanced analytics", "Priority support"],
    total: 4.99
  },
  pro_yearly: {
    name: "Pro Yearly",
    price: "$35.00",
    period: "year",
    originalPrice: "$59.88",
    savings: "$24.88",
    features: ["Everything in Pro", "40% savings", "2 months free", "Priority support"],
    total: 35.00
  }
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planType, setPlanType] = useState<keyof typeof planDetails>("pro_monthly");
  const { toast } = useToast();

  // Get plan from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') as keyof typeof planDetails;
    if (plan && planDetails[plan]) {
      setPlanType(plan);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange"
  });

  const plan = planDetails[planType];

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store subscription info
      const subscriptionData = {
        plan: planType,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        startDate: new Date().toISOString(),
        status: 'active'
      };
      localStorage.setItem('tipvault-subscription', JSON.stringify(subscriptionData));

      // Success
      toast({
        title: "Welcome to TipVault Pro!",
        description: "Your subscription is now active. Let's set up your tip page.",
      });

      // Redirect to success page
      setTimeout(() => {
        setLocation('/success');
      }, 1500);

    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please check your card details and try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <Card className="p-6 border border-gray-200">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                    
                    {/* Plan Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <Badge className="bg-blue-600 text-white">
                          <Sparkles size={12} className="mr-1" />
                          Popular
                        </Badge>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {plan.price}
                        <span className="text-base font-normal text-gray-600">/{plan.period}</span>
                      </div>
                      
                      {plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-500 line-through">{plan.originalPrice}</span>
                          <span className="text-sm font-medium text-green-600">Save {plan.savings}</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check size={14} className="text-green-600" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${plan.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>${plan.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Trial Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Shield size={16} />
                        <span className="text-sm font-medium">7-day free trial</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Checkout Form */}
          <div className="lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <button
                  onClick={() => setLocation('/pricing')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to pricing
                </button>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
                  <p className="text-gray-600 mt-2">
                    Start your 7-day free trial of TipVault Pro. Cancel anytime.
                  </p>
                </div>
              </div>

              {/* Form */}
              <Card className="p-6 border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    
                    <div>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="Email address"
                        className={errors.email ? "border-red-300" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register("firstName")}
                          placeholder="First name"
                          className={errors.firstName ? "border-red-300" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...register("lastName")}
                          placeholder="Last name"
                          className={errors.lastName ? "border-red-300" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    
                    <div>
                      <div className="relative">
                        <Input
                          {...register("cardNumber")}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={errors.cardNumber ? "border-red-300" : ""}
                          onChange={(e) => {
                            e.target.value = formatCardNumber(e.target.value);
                          }}
                        />
                        <CreditCard size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      {errors.cardNumber && (
                        <p className="text-sm text-red-600 mt-1">{errors.cardNumber.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register("expiryDate")}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={errors.expiryDate ? "border-red-300" : ""}
                          onChange={(e) => {
                            e.target.value = formatExpiryDate(e.target.value);
                          }}
                        />
                        {errors.expiryDate && (
                          <p className="text-sm text-red-600 mt-1">{errors.expiryDate.message}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...register("cvv")}
                          type="password"
                          placeholder="CVV"
                          maxLength={4}
                          className={errors.cvv ? "border-red-300" : ""}
                        />
                        {errors.cvv && (
                          <p className="text-sm text-red-600 mt-1">{errors.cvv.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Input
                        {...register("billingZip")}
                        placeholder="Billing ZIP code"
                        className={errors.billingZip ? "border-red-300" : ""}
                      />
                      {errors.billingZip && (
                        <p className="text-sm text-red-600 mt-1">{errors.billingZip.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Lock size={16} />
                      <span className="text-sm font-medium">Secure Payment</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isValid || isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Start 7-Day Free Trial`
                    )}
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    By clicking "Start 7-Day Free Trial", you agree to our Terms of Service and Privacy Policy. 
                    You can cancel anytime before your trial ends.
                  </div>
                </form>


              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}