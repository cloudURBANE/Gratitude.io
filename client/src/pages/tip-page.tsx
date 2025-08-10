import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Star, Coffee, Zap, DollarSign, Heart, Sparkles, 
  MessageSquare, StarIcon, Send, CheckCircle, Wallet, 
  Smartphone, Copy, ExternalLink, ArrowLeft, Gift, Crown,
  TrendingUp, Target, Users, Banknote, CreditCard, 
  User, Building, MapPinIcon, BriefcaseIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TipPage() {
  const [match, params] = useRoute('/u/:handle');
  const { toast } = useToast();
  
  // Multi-step tip flow states
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'review' | 'success'>('select');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [tipperName, setTipperName] = useState<string>('');
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/profiles', params?.handle],
    queryFn: () => fetch(`/api/profiles/${params?.handle}`).then(res => {
      if (!res.ok) throw new Error('Profile not found');
      return res.json();
    }),
    enabled: !!params?.handle
  });

  const predefinedAmounts = [5, 10, 15, 20, 25, 50];

  useEffect(() => {
    // Track page view analytics
    if (profile) {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: profile.id,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Silent fail for analytics
    }
  }, [profile]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setCurrentStep('payment');
  };

  const handleCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount > 0) {
      setSelectedAmount(amount);
      setCurrentStep('payment');
    }
  };

  const handlePayment = async (method: string) => {
    setSelectedPayment(method);
    
    let paymentUrl = '';
    const amount = selectedAmount;
    const note = `Tip for ${profile.displayName}`;
    
    switch (method) {
      case 'venmo':
        if (profile.venmoHandle) {
          paymentUrl = `venmo://paycharge?txn=pay&recipients=${profile.venmoHandle}&amount=${amount}&note=${encodeURIComponent(note)}`;
          // Fallback for web
          if (!window.location.href.includes('venmo://')) {
            window.open(`https://venmo.com/u/${profile.venmoHandle}`, '_blank');
          } else {
            window.location.href = paymentUrl;
          }
        }
        break;
      case 'cashapp':
        if (profile.cashappHandle) {
          paymentUrl = `https://cash.app/$${profile.cashappHandle}/${amount}`;
          window.open(paymentUrl, '_blank');
        }
        break;
      case 'zelle':
        if (profile.zelleInfo) {
          // Copy email to clipboard and show instructions
          navigator.clipboard.writeText(profile.zelleInfo);
          toast({
            title: "Zelle Email Copied!",
            description: `Send $${amount} to ${profile.zelleInfo} via your bank's Zelle`,
          });
        }
        break;
    }
    
    // Move to review step after payment initiation
    setTimeout(() => {
      setCurrentStep('review');
    }, 2000);
  };

  const handleSubmitReview = async () => {
    try {
      await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          amount: selectedAmount,
          paymentMethod: selectedPayment,
          rating,
          review,
          tipperName,
          timestamp: new Date().toISOString()
        })
      });
      
      setCurrentStep('success');
      
      // Track conversion
      fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          amount: selectedAmount,
          paymentMethod: selectedPayment
        })
      }).catch(() => {});
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Your tip was still sent!",
        variant: "destructive"
      });
      setCurrentStep('success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/70">Loading tip page...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="text-6xl mb-4">🕵️</div>
          <h1 className="text-3xl font-bold text-white">Profile Not Found</h1>
          <p className="text-white/70 text-lg">
            This tip page doesn't exist or has been deactivated.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Header with TipVault branding */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TipVault
                  </h1>
                  <p className="text-white/50 text-xs">Secure Tip Platform</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Verified Worker
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {currentStep === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                  <CardContent className="p-8 text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-green-500/20">
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-green-500 to-blue-500 text-white">
                        {profile.displayName?.split(' ').map((n: string) => n[0]).join('') || 'TW'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {profile.displayName || `${profile.user?.firstName} ${profile.user?.lastName}`}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
                        <BriefcaseIcon className="w-3 h-3 mr-1" />
                        {profile.jobTitle || 'Service Worker'}
                      </Badge>
                      {profile.businessName && (
                        <Badge className="bg-gradient-to-r from-purple-500/20 to-green-500/20 text-purple-400 border border-purple-500/30">
                          <Building className="w-3 h-3 mr-1" />
                          {profile.businessName}
                        </Badge>
                      )}
                    </div>
                    
                    {profile.description && (
                      <p className="text-white/70 text-lg max-w-md mx-auto leading-relaxed">
                        {profile.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <StarIcon key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-white/60 text-sm ml-2">Verified Professional</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Amount Selection */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
                  <CardHeader className="text-center">
                    <CardTitle className="text-white flex items-center justify-center gap-3 text-2xl">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
                        <Heart className="w-6 h-6 text-green-400" />
                      </div>
                      Show Your Appreciation
                    </CardTitle>
                    <p className="text-white/60">Choose an amount that reflects the great service you received</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pb-8">
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                      {predefinedAmounts.map((amount) => (
                        <motion.button
                          key={amount}
                          onClick={() => handleAmountSelect(amount)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur group-hover:blur-md transition-all" />
                          <div className="relative bg-black/40 border border-white/20 rounded-xl p-4 group-hover:bg-black/60 transition-all">
                            <div className="text-2xl font-bold text-white">${amount}</div>
                            <div className="text-xs text-white/60">
                              {amount <= 10 ? 'Great' : amount <= 20 ? 'Excellent' : 'Amazing'}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Enter custom amount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg font-semibold"
                          />
                        </div>
                        <Button
                          onClick={handleCustomAmount}
                          disabled={!customAmount || parseFloat(customAmount) <= 0}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Tip
                        </Button>
                      </div>
                    </div>

                    {/* Value Props */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-3">
                        <Sparkles className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-xs text-white/80">Your tip goes directly to the worker</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-3">
                        <CheckCircle className="w-5 h-5 text-blue-400 mb-2" />
                        <p className="text-xs text-white/80">Secure & instant transfer</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-xl p-3">
                        <Crown className="w-5 h-5 text-purple-400 mb-2" />
                        <p className="text-xs text-white/80">Support great service</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Amount Confirmation */}
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('select')}
                  className="border-white/20 text-white/80 hover:bg-white/10 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Amount
                </Button>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-lg" />
                  <div className="relative bg-black/40 border border-white/20 rounded-2xl px-8 py-6">
                    <div className="text-4xl font-bold text-white mb-2">${selectedAmount.toFixed(2)}</div>
                    <div className="text-white/60">for {profile.displayName}</div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-blue-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-green-500 to-blue-500" />
                  <CardHeader className="text-center">
                    <CardTitle className="text-white flex items-center justify-center gap-3 text-2xl">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-green-500/20">
                        <Wallet className="w-6 h-6 text-purple-400" />
                      </div>
                      Choose Payment Method
                    </CardTitle>
                    <p className="text-white/60">Select your preferred way to send the tip</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pb-8">
                    {profile.venmoHandle && (
                      <motion.button
                        onClick={() => handlePayment('venmo')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur group-hover:blur-md transition-all" />
                          <div className="relative bg-black/40 border border-white/20 rounded-xl p-6 group-hover:bg-black/60 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-white font-semibold text-lg">Venmo</div>
                                <div className="text-white/60">@{profile.venmoHandle}</div>
                              </div>
                              <ExternalLink className="w-5 h-5 text-white/40" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )}

                    {profile.cashappHandle && (
                      <motion.button
                        onClick={() => handlePayment('cashapp')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur group-hover:blur-md transition-all" />
                          <div className="relative bg-black/40 border border-white/20 rounded-xl p-6 group-hover:bg-black/60 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-white font-semibold text-lg">Cash App</div>
                                <div className="text-white/60">${profile.cashappHandle}</div>
                              </div>
                              <ExternalLink className="w-5 h-5 text-white/40" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )}

                    {profile.zelleInfo && (
                      <motion.button
                        onClick={() => handlePayment('zelle')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-green-500/20 rounded-xl blur group-hover:blur-md transition-all" />
                          <div className="relative bg-black/40 border border-white/20 rounded-xl p-6 group-hover:bg-black/60 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-white font-semibold text-lg">Zelle</div>
                                <div className="text-white/60">{profile.zelleInfo}</div>
                              </div>
                              <Copy className="w-5 h-5 text-white/40" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-white mb-2">Tip Sent Successfully!</h1>
                <p className="text-white/70 text-lg">
                  Your ${selectedAmount} tip has been sent to {profile.displayName}
                </p>
              </div>

              {/* Review Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                  <CardHeader className="text-center">
                    <CardTitle className="text-white flex items-center justify-center gap-3 text-xl">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      Leave a Review (Optional)
                    </CardTitle>
                    <p className="text-white/60">Help others discover great service</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pb-8">
                    {/* Star Rating */}
                    <div className="text-center">
                      <p className="text-white/80 mb-4">How was your experience?</p>
                      <div className="flex justify-center gap-2">
                        {[1,2,3,4,5].map((star) => (
                          <motion.button
                            key={star}
                            onClick={() => setRating(star)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <StarIcon 
                              className={`w-8 h-8 transition-colors ${
                                star <= rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-white/30'
                              }`} 
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                      <label className="text-white/80 font-medium">Share your experience</label>
                      <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Tell others about the great service you received..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-white/50 text-right">{review.length}/500 characters</p>
                    </div>

                    {/* Tipper Name */}
                    <div className="space-y-2">
                      <label className="text-white/80 font-medium">Your name (optional)</label>
                      <Input
                        value={tipperName}
                        onChange={(e) => setTipperName(e.target.value)}
                        placeholder="Leave blank to stay anonymous"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setCurrentStep('success')}
                        variant="outline"
                        className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
                      >
                        Skip Review
                      </Button>
                      <Button
                        onClick={handleSubmitReview}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                  <CardContent className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                      className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h1 className="text-3xl font-bold text-white mb-4">
                      Thank You for Your Generosity!
                    </h1>
                    <p className="text-white/70 text-lg mb-8">
                      Your ${selectedAmount} tip means a lot to {profile.displayName} and helps support quality service.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                        <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-white/80">You're supporting local workers</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                        <Heart className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-white/80">Every tip makes a difference</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-xl p-4">
                        <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-white/80">You're encouraging great service</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setCurrentStep('select');
                        setSelectedAmount(0);
                        setCustomAmount('');
                        setRating(5);
                        setReview('');
                        setTipperName('');
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Tip Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}