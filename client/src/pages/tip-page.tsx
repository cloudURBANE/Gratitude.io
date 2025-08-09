import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  TipMemoryManager, 
  SmartDefaultsManager, 
  ReturnFlowManager,
  parseSmartParams,
  getWhisperBoostConfig
} from "@/lib/tip-memory";

import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import TipPreset from "@/components/tip-preset";
import { PaymentMethodWithIcon } from "@/components/payment-app-icons";
import ThumbDial from "@/components/thumb-dial";
import OneTapRepeat from "@/components/one-tap-repeat";
import WhisperBoost from "@/components/whisper-boost";
import ReturnFlowReviews from "@/components/return-flow-reviews";
import EnhancedGlassCard from "@/components/enhanced-glass-card";
import EnhancedPaymentButton from "@/components/enhanced-payment-button";
import ProfileEditor from "@/components/profile-editor";
import PaymentModal from "@/components/payment-modal";
import ZelleModal from "@/components/zelle-modal";
import ReviewPrompt from "@/components/review-prompt";

interface Worker {
  id: string;
  name: string;
  role: string;
  location: string;
  handle: string;
  avatarUrl?: string;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleHandle?: string;
  stripeAccountId?: string;
  googleReviewUrl?: string;
  yelpReviewUrl?: string;
  todayStats: {
    totalTips: number;
    totalAmount: string;
    avgAmount: string;
  };
}

export default function TipPage() {
  const { handle } = useParams<{ handle: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [tipNote, setTipNote] = useState("");
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showZelleModal, setShowZelleModal] = useState(false);
  const [showOneTapRepeat, setShowOneTapRepeat] = useState(false);
  const [showReturnFlowReviews, setShowReturnFlowReviews] = useState(false);
  const [whisperBoostEnabled, setWhisperBoostEnabled] = useState(false);

  // Demo data for when handle is 'demo'
  const demoWorker: Worker = {
    id: 'demo-id',
    name: 'Jordan M.',
    role: 'Barista & Shift Lead',
    location: 'Seattle, WA',
    handle: 'demo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    venmoHandle: 'jordan-coffee',
    cashappHandle: 'jordanbarista',
    zelleHandle: 'jordan@coffee.com',
    stripeAccountId: 'demo-stripe',
    googleReviewUrl: 'https://g.page/demo',
    yelpReviewUrl: 'https://yelp.com/demo',
    todayStats: {
      totalTips: 8,
      totalAmount: '94.00',
      avgAmount: '11.75',
    },
  };

  const { data: workerData, isLoading, error } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle && handle !== 'demo',
  });

  // Initialize TipLink Express managers
  const tipMemoryManager = new TipMemoryManager();
  const smartDefaultsManager = new SmartDefaultsManager();
  const returnFlowManager = new ReturnFlowManager();
  const whisperBoostConfig = getWhisperBoostConfig();

  const worker = handle === 'demo' ? demoWorker : workerData;

  // TipLink Express initialization
  useEffect(() => {
    if (!handle) return;

    const currentWorker = handle === 'demo' ? demoWorker : workerData;
    if (currentWorker?.id) {
      // Track QR scan
      const recordScan = async () => {
        try {
          await apiRequest("POST", "/api/qr-scans", {
            workerId: currentWorker.id,
          });
        } catch (error) {
          console.error("Failed to record QR scan:", error);
        }
      };
      recordScan();
    }

    // Check for URL parameters (smart defaults)
    const urlParams = parseSmartParams();
    if (urlParams.amount && urlParams.amount > 0) {
      setSelectedAmount(urlParams.amount);
      setCustomAmount("");
    }
    if (urlParams.method) {
      setSelectedPaymentMethod(urlParams.method);
    }

    // Check for previous tip memory (One-Tap Repeat)
    const lastTip = tipMemoryManager.getLastTip(handle);
    if (lastTip && !urlParams.amount && !urlParams.method) {
      setShowOneTapRepeat(true);
    } else if (!lastTip && !urlParams.amount && !urlParams.method) {
      // Apply smart defaults for new users
      const smartDefaults = smartDefaultsManager.getSmartDefaults();
      setSelectedAmount(smartDefaults.amount);
      setSelectedPaymentMethod(smartDefaults.method);
    }

    // Set up return flow detection
    returnFlowManager.onReturn(() => {
      setShowReturnFlowReviews(true);
    });

    return () => {
      returnFlowManager.destroy();
    };
  }, [handle, workerData]);

  const createTipMutation = useMutation({
    mutationFn: async (tipData: any) => {
      return await apiRequest("POST", "/api/tips", tipData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers", handle] });
      toast({
        title: "Tip sent successfully!",
        description: "Your tip has been processed.",
      });

      // Reset form
      setSelectedAmount(null);
      setCustomAmount("");
      setSelectedPaymentMethod(null);
      setTipNote("");
      setShowPaymentModal(false);

      // Show review prompt after successful tip (30% chance to avoid being intrusive)  
      if (Math.random() < 0.3 && worker && (worker.googleReviewUrl || worker.yelpReviewUrl)) {
        setTimeout(() => setShowReviewPrompt(true), 1500);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process tip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTipAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const getCurrentAmount = () => {
    const baseAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null);
    if (baseAmount && whisperBoostEnabled) {
      return baseAmount + whisperBoostConfig.amount;
    }
    return baseAmount;
  };

  const canSendTip = () => {
    const amount = getCurrentAmount();
    return amount && amount > 0 && selectedPaymentMethod;
  };

  const handleSendTip = () => {
    if (!canSendTip() || !worker) return;

    const amount = getCurrentAmount()!;

    // Save this tip to memory for future One-Tap Repeat
    if (handle) {
      tipMemoryManager.saveLastTip(handle, amount, selectedPaymentMethod);
    }

    if (selectedPaymentMethod === 'stripe') {
      // For Stripe, redirect to checkout
      setLocation(`/u/${handle}/checkout?amount=${amount}&note=${encodeURIComponent(tipNote)}`);
    } else if (selectedPaymentMethod === 'zelle') {
      // For Zelle, show dedicated modal
      setShowZelleModal(true);
    } else {
      // For Venmo and Cash App, show payment modal
      setShowPaymentModal(true);
    }
  };

  const handleCopyTipLink = () => {
    const url = `${window.location.origin}/u/${handle}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Tip link copied to clipboard.",
      });
    });
  };

  const handleOpenReview = (type: 'google' | 'yelp') => {
    const url = type === 'google' ? worker?.googleReviewUrl : worker?.yelpReviewUrl;
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Review link not available",
        description: `${type === 'google' ? 'Google' : 'Yelp'} review link not set up yet.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && handle !== 'demo') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Worker Not Found</h1>
          <p className="text-text-secondary mb-6">
            The tip page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <GradientButton>Go Home</GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        
        {/* One-Tap Repeat for returning customers */}
        {showOneTapRepeat && handle && (
          <OneTapRepeat
            memory={tipMemoryManager.getLastTip(handle)!}
            onRepeat={() => {
              const memory = tipMemoryManager.getLastTip(handle)!;
              setSelectedAmount(memory.amount);
              setSelectedPaymentMethod(memory.method);
              setShowOneTapRepeat(false);
              // Auto-proceed with the remembered tip
              setTimeout(() => handleSendTip(), 100);
            }}
            onChangeAmount={() => {
              setShowOneTapRepeat(false);
            }}
          />
        )}
        {/* Header with worker info */}
        <GlassCard className="rounded-2xl p-6 mb-6 text-center">
          <img 
            src={worker.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
            alt={`${worker.name} - ${worker.role}`}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-glass-border" 
          />
          <h1 className="text-2xl font-semibold text-text-primary mb-1">{worker.name}</h1>
          <p className="text-text-secondary mb-1">{worker.role}</p>
          {worker.location && (
            <p className="text-sm text-text-secondary flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>{worker.location}</span>
            </p>
          )}
        </GlassCard>

        {/* Say thanks message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-text-primary mb-2">Say thanks with a tip ✨</h2>
          <GlassCard className="rounded-xl p-4">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Tips received today</span>
              <span>{worker.todayStats.totalTips}</span>
            </div>
            <div className="w-full bg-glass rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent-start to-accent-end h-2 rounded-full transition-all duration-500" 
                style={{ width: Math.min((worker.todayStats.totalTips / 20) * 100, 100) + '%' }}
              ></div>
            </div>
          </GlassCard>
        </div>

        {/* Genius Thumb Dial - hidden when showing One-Tap Repeat */}
        {!showOneTapRepeat && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-6 text-center">
              Say thanks in 2 taps
            </h3>
            <ThumbDial
              onAmountChange={(amount) => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              selectedAmount={selectedAmount}
              customAmount={customAmount}
            />
          </div>
        )}

        {/* Payment methods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Choose payment method</h3>
          <div className="grid grid-cols-1 gap-3">
            <PaymentMethodWithIcon
              method="stripe"
              isSelected={selectedPaymentMethod === 'stripe'}
              onClick={() => handlePaymentMethodSelect('stripe')}
            />
            
            {worker.venmoHandle && (
              <PaymentMethodWithIcon
                method="venmo"
                handle={worker.venmoHandle}
                isSelected={selectedPaymentMethod === 'venmo'}
                onClick={() => handlePaymentMethodSelect('venmo')}
              />
            )}

            {worker.cashappHandle && (
              <PaymentMethodWithIcon
                method="cashapp"
                handle={worker.cashappHandle}
                isSelected={selectedPaymentMethod === 'cashapp'}
                onClick={() => handlePaymentMethodSelect('cashapp')}
              />
            )}

            {worker.zelleHandle && (
              <PaymentMethodWithIcon
                method="zelle"
                handle={worker.zelleHandle}
                isSelected={selectedPaymentMethod === 'zelle'}
                onClick={() => handlePaymentMethodSelect('zelle')}
              />
            )}
          </div>
        </div>

        {/* Whisper Boost - optional $1 add-on */}
        <WhisperBoost
          config={whisperBoostConfig}
          currentAmount={selectedAmount || (customAmount ? parseFloat(customAmount) : 0) || 0}
          onBoostChange={setWhisperBoostEnabled}
        />

        {/* Optional note */}
        <div className="mb-6">
          <GlassCard className="rounded-xl p-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Add a note for {worker.name} (optional)
            </label>
            <textarea 
              className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20 resize-none" 
              rows={3}
              maxLength={140}
              placeholder="Thanks for the amazing service!" 
              value={tipNote}
              onChange={(e) => setTipNote(e.target.value)}
            />
            <div className="text-xs text-text-secondary text-right mt-1">
              {tipNote.length}/140
            </div>
          </GlassCard>
        </div>

        {/* Enhanced primary action button */}
        <div className="mb-6">
          <EnhancedPaymentButton
            onClick={handleSendTip}
            disabled={!canSendTip()}
            paymentMethod={selectedPaymentMethod as 'venmo' | 'cashapp' | 'zelle' | 'stripe'}
            amount={getCurrentAmount() || 0}
            className="text-lg font-semibold"
          >
            {canSendTip() 
              ? `Send $${getCurrentAmount()} tip` 
              : 'Select amount & method to continue'
            }
          </EnhancedPaymentButton>
        </div>

        {/* Enhanced reviews section with glass chips */}
        <EnhancedGlassCard className="rounded-xl p-4 mb-6" depth="interactive">
          <h3 className="font-medium text-text-primary mb-3">Leave a quick 5⭐ note?</h3>
          <div className="flex gap-3">
            <EnhancedGlassCard 
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 cursor-pointer text-sm font-medium"
              depth="interactive"
              onClick={() => handleOpenReview('google')}
            >
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-text-primary">Google</span>
            </EnhancedGlassCard>
            <EnhancedGlassCard 
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 cursor-pointer text-sm font-medium"
              depth="interactive" 
              onClick={() => handleOpenReview('yelp')}
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 12.013l3.234 2.394a.8.8 0 0 0 1.24-.672l.228-1.39a.8.8 0 0 0-.287-.849L13.25 9.525a.8.8 0 0 0-1.233.697v1.791z"/>
                <path d="M12.017 12.013l-3.234 2.394a.8.8 0 0 1-1.24-.672l-.228-1.39a.8.8 0 0 1 .287-.849l3.182-1.971a.8.8 0 0 1 1.233.697v1.791z"/>
                <path d="M12.017 12.013L8.783 9.619a.8.8 0 0 0-1.24.672l-.228 1.39a.8.8 0 0 0 .287.849l3.182 1.971a.8.8 0 0 0 1.233-.697v-1.791z"/>
                <path d="M12.017 12.013l3.234-2.394a.8.8 0 0 1 1.24.672l.228 1.39a.8.8 0 0 1-.287.849l-3.182 1.971a.8.8 0 0 1-1.233-.697v-1.791z"/>
                <path d="M12 2.475L8.683 3.85a.8.8 0 0 0-.287.849l.228 1.39a.8.8 0 0 0 1.24.672L12 4.366a.8.8 0 0 0 0-1.891z"/>
              </svg>
              <span className="text-text-primary">Yelp</span>
            </EnhancedGlassCard>
          </div>
        </EnhancedGlassCard>

        {/* Share section */}
        <GlassCard className="rounded-xl p-4 text-center">
          <p className="text-text-secondary mb-3">Share my TipLink</p>
          <button 
            className="flex items-center gap-2 mx-auto py-2 px-4 bg-glass hover:bg-glass-border rounded-lg transition-all duration-200 focus-visible" 
            onClick={handleCopyTipLink}
          >
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span className="text-text-primary text-sm">Copy URL</span>
          </button>
        </GlassCard>

        {/* Edit profile floating button */}
        <button 
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-accent-start to-accent-end rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 focus-visible" 
          onClick={() => setShowProfileEditor(true)}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
      </div>

      {/* Modals */}
      {showProfileEditor && (
        <ProfileEditor
          worker={worker}
          onClose={() => setShowProfileEditor(false)}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          worker={worker}
          amount={getCurrentAmount()!}
          paymentMethod={selectedPaymentMethod!}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            setLocation('/success');
          }}
        />
      )}

      {showReviewPrompt && worker && (
        <ReviewPrompt
          worker={worker}
          onClose={() => setShowReviewPrompt(false)}
          onReviewSubmitted={() => {
            toast({
              title: "Thank you!",
              description: "Your review helps support great service workers.",
            });
          }}
        />
      )}

      {showZelleModal && worker && (
        <ZelleModal
          worker={worker}
          amount={getCurrentAmount()!}
          onClose={() => setShowZelleModal(false)}
          onSuccess={() => {
            setShowZelleModal(false);
            createTipMutation.mutate({
              workerId: worker.id,
              amount: getCurrentAmount()!.toString(),
              paymentMethod: 'zelle',
              note: tipNote || `Tip for ${worker.name}`,
            });
            setLocation('/success');
          }}
        />
      )}

      {/* Return Flow Reviews - slide in when user returns from payment app */}
      {showReturnFlowReviews && worker && (
        <ReturnFlowReviews
          worker={worker}
          onClose={() => setShowReturnFlowReviews(false)}
          onReviewClick={(type) => {
            const url = type === 'google' ? worker.googleReviewUrl : worker.yelpReviewUrl;
            if (url) {
              window.open(url, '_blank');
              setShowReturnFlowReviews(false);
            }
          }}
        />
      )}
    </div>
  );
}
