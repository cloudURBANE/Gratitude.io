import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  DollarSign, 
  User, 
  AtSign,
  MessageSquare,
  Smartphone,
  QrCode,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { Link } from 'wouter';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handle: '',
    bio: '',
    workplace: '',
    jobTitle: '',
    venmoHandle: '',
    cashappHandle: '',
    zelleEmail: ''
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/profiles', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created Successfully!",
        description: "Welcome to TipVault. Your tip page is now live and ready to earn.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Redirect to welcome dashboard
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    console.log('Creating profile:', formData);
    createProfileMutation.mutate(formData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim();
      case 2:
        return formData.handle.trim() && formData.workplace.trim();
      case 3:
        return formData.venmoHandle.trim() || formData.cashappHandle.trim() || formData.zelleEmail.trim();
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* TipVault Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TipVault
                  </h1>
                  <p className="text-white/60 text-xs">Instant Money Platform</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Quick Setup
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome to TipVault
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Create your professional tip collection page in under 60 seconds
            </p>
            
            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-white/80">Start earning instantly</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                <Wallet className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-white/80">Multiple payment options</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-xl p-4">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-white/80">Boost your income 300%</p>
              </div>
            </div>
          </motion.div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= num 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 border-green-500 text-white' 
                    : 'bg-black/40 border-white/20 text-white/60'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-3 rounded-full transition-all ${
                    step > num ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-white/60 text-sm">
            Step {step} of 3: {step === 1 ? 'Personal Information' : step === 2 ? 'Your Tip Page' : 'Payment Methods'}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
          <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
            
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center gap-3 text-xl justify-center">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
                  {step === 1 && <User className="w-6 h-6 text-green-400" />}
                  {step === 2 && <AtSign className="w-6 h-6 text-blue-400" />}
                  {step === 3 && <Wallet className="w-6 h-6 text-purple-400" />}
                </div>
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Your Professional Tip Page'}
                {step === 3 && 'Payment Methods'}
              </CardTitle>
              <p className="text-center text-white/60 text-sm">
                {step === 1 && 'Tell us about yourself to create your profile'}
                {step === 2 && 'Customize your tip page for maximum earnings'}
                {step === 3 && 'Connect your payment methods to start receiving tips'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6 pb-8">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/80 font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/80 font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-white/80 font-medium">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                        placeholder="Server, Barista, Driver, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workplace" className="text-white/80 font-medium">Workplace</Label>
                      <Input
                        id="workplace"
                        value={formData.workplace}
                        onChange={(e) => handleInputChange('workplace', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                        placeholder="Restaurant or business name"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-2">
                      <Sparkles className="w-4 h-4" />
                      Pro Tip
                    </div>
                    <p className="text-xs text-white/70">
                      Service workers with complete profiles earn 67% more in tips than those with basic information.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="text-white/80 font-medium">Tip Page Handle *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">tipvault.com/u/</span>
                      <Input
                        id="handle"
                        value={formData.handle}
                        onChange={(e) => handleInputChange('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 transition-colors pl-32"
                        placeholder="your-name"
                      />
                    </div>
                    <p className="text-xs text-white/50">This will be your unique tip page URL</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workplace" className="text-white/80 font-medium">Workplace *</Label>
                    <Input
                      id="workplace"
                      value={formData.workplace}
                      onChange={(e) => handleInputChange('workplace', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 transition-colors"
                      placeholder="Where do you work?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white/80 font-medium">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 transition-colors min-h-[100px] resize-none"
                      placeholder="Tell customers about your service and what makes you special..."
                      maxLength={200}
                    />
                    <p className="text-xs text-white/50 text-right">{formData.bio.length}/200 characters</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-400 font-medium text-sm mb-2">
                      <Star className="w-4 h-4" />
                      Earnings Boost
                    </div>
                    <p className="text-xs text-white/70">
                      Workers with personalized bios and clear workplace info receive 85% more repeat customers.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-white font-semibold mb-2">Connect Your Payment Methods</h3>
                    <p className="text-white/60 text-sm">Add at least one payment method to start receiving tips</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venmoHandle" className="text-white/80 font-medium flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        Venmo Handle
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">@</span>
                        <Input
                          id="venmoHandle"
                          value={formData.venmoHandle}
                          onChange={(e) => handleInputChange('venmoHandle', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 transition-colors pl-8"
                          placeholder="your-venmo"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cashappHandle" className="text-white/80 font-medium flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        Cash App Handle
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">$</span>
                        <Input
                          id="cashappHandle"
                          value={formData.cashappHandle}
                          onChange={(e) => handleInputChange('cashappHandle', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 transition-colors pl-8"
                          placeholder="YourCashApp"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zelleEmail" className="text-white/80 font-medium flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded" />
                        Zelle Email
                      </Label>
                      <Input
                        id="zelleEmail"
                        type="email"
                        value={formData.zelleEmail}
                        onChange={(e) => handleInputChange('zelleEmail', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-400 font-medium text-sm mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Multiple Payment Options
                    </div>
                    <p className="text-xs text-white/70">
                      Workers with 2+ payment methods receive 127% more tips. Customers prefer choice and convenience.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-white/10">
                {step > 1 ? (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10"
                  >
                    Back
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                      Back to Login
                    </Button>
                  </Link>
                )}

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid() || createProfileMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 text-white font-semibold px-8"
                  >
                    {createProfileMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Profile...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Complete Setup
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}