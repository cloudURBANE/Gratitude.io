import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GlassCard from "@/components/glass-card";
import QuickTip from "@/components/quick-tip";
import SmartDock from "@/components/smart-dock";
import SnakeGame from "@/components/snake-game";
import { buildPayUrl, defaultPayMethod, type PayMethod } from "@/lib/snake-pay";

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
}

type FlowStep = "amount" | "payment" | "processing" | "review" | "complete";

export default function TipFlow() {
  const { handle } = useParams<{ handle: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>("stripe");
  const [isGameMode, setIsGameMode] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Demo worker data
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
  };

  const { data: workerData } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle && handle !== 'demo',
  });

  const worker = handle === 'demo' ? demoWorker : workerData;

  // Auto-advance from amount to payment when amount is selected
  useEffect(() => {
    if (currentStep === "amount" && selectedAmount > 0) {
      setTimeout(() => setCurrentStep("payment"), 500);
    }
  }, [selectedAmount, currentStep]);

  // Handle payment method selection
  const handlePaymentSelect = (method: PayMethod) => {
    setSelectedMethod(method);
    setCurrentStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingComplete(true);
      setTimeout(() => setCurrentStep("review"), 800);
    }, 2000);
  };

  // Handle review actions
  const handleReviewAction = (action: 'google' | 'yelp' | 'wallet' | 'skip') => {
    if (action === 'google' && worker?.googleReviewUrl) {
      window.open(worker.googleReviewUrl, '_blank');
    } else if (action === 'yelp' && worker?.yelpReviewUrl) {
      window.open(worker.yelpReviewUrl, '_blank');
    } else if (action === 'wallet') {
      // TODO: Generate wallet pass
      toast({
        title: "Wallet Pass",
        description: "Feature coming soon!",
      });
    }
    
    setCurrentStep("complete");
  };

  // Reset flow
  const startOver = () => {
    setCurrentStep("amount");
    setSelectedAmount(0);
    setSelectedMethod("stripe");
    setProcessingComplete(false);
  };

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  const pageVariants = {
    enter: { opacity: 0, x: 20, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-glass z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-start to-accent-end"
          initial={{ width: "0%" }}
          animate={{
            width: currentStep === "amount" ? "25%" :
                  currentStep === "payment" ? "50%" :
                  currentStep === "processing" ? "75%" :
                  "100%"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Amount Selection */}
        {currentStep === "amount" && (
          <motion.div
            key="amount"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
              <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-start to-accent-end mx-auto mb-4 flex items-center justify-center">
                  {worker.avatarUrl ? (
                    <img src={worker.avatarUrl} alt={worker.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{worker.name.charAt(0)}</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-1">{worker.name}</h1>
                <p className="text-text-secondary">{worker.role} • {worker.location}</p>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 px-4 pb-8">
              <div className="max-w-md mx-auto">
                {/* Mode selector */}
                <div className="flex justify-center mb-8">
                  <div className="bg-glass backdrop-blur-md border border-glass-border rounded-lg p-1 flex">
                    <button
                      onClick={() => setIsGameMode(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        !isGameMode
                          ? 'bg-accent-start text-white shadow-md'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Quick Tip
                    </button>
                    <button
                      onClick={() => setIsGameMode(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isGameMode
                          ? 'bg-accent-start text-white shadow-md'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Snake Game
                    </button>
                  </div>
                </div>

                {/* Amount input methods */}
                {!isGameMode ? (
                  <QuickTip
                    onAmountSelect={setSelectedAmount}
                    selectedAmount={selectedAmount}
                  />
                ) : (
                  <SnakeGame
                    worker={worker}
                    onTipEarned={(amount) => setSelectedAmount(amount)}
                  />
                )}

                {/* Continue hint */}
                {selectedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6 text-text-secondary text-sm"
                  >
                    Continuing to payment...
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === "payment" && (
          <motion.div
            key="payment"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex flex-col justify-center px-4"
          >
            <div className="max-w-md mx-auto w-full">
              {/* Amount display */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">${selectedAmount}</div>
                <div className="text-text-secondary">for {worker.name}</div>
              </div>

              {/* Payment methods */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-center">Choose payment method</h2>
                
                <SmartDock
                  amount={selectedAmount}
                  worker={worker}
                  onPaymentMethodSelect={(method: string) => handlePaymentSelect(method as PayMethod)}
                />
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {currentStep === "processing" && (
          <motion.div
            key="processing"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex flex-col justify-center px-4"
          >
            <div className="max-w-md mx-auto text-center">
              <motion.div
                animate={processingComplete ? { scale: 1.1 } : { rotate: 360 }}
                transition={
                  processingComplete 
                    ? { duration: 0.3, ease: "easeOut" }
                    : { duration: 2, repeat: Infinity, ease: "linear" }
                }
                className="w-20 h-20 mx-auto mb-6"
              >
                {processingComplete ? (
                  <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full border-4 border-accent-start border-t-transparent rounded-full" />
                )}
              </motion.div>

              <div className="text-2xl font-bold mb-2">
                {processingComplete ? "Payment Sent!" : "Processing Payment"}
              </div>
              
              <div className="text-text-secondary mb-4">
                {processingComplete 
                  ? `$${selectedAmount} sent to ${worker.name}`
                  : "Please wait while we process your payment..."
                }
              </div>

              {processingComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-text-secondary"
                >
                  Redirecting to review...
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Review Prompt */}
        {currentStep === "review" && (
          <motion.div
            key="review"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex flex-col justify-center px-4"
          >
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold mb-2">Help {worker.name} shine!</h2>
                <p className="text-text-secondary">A quick review makes a huge difference</p>
              </div>

              <div className="space-y-3">
                {/* Google Review */}
                {worker.googleReviewUrl && (
                  <button
                    onClick={() => handleReviewAction('google')}
                    className="w-full p-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl flex items-center gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Leave Google Review</div>
                      <div className="text-sm text-text-secondary">Help others discover great service</div>
                    </div>
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Yelp Review */}
                {worker.yelpReviewUrl && (
                  <button
                    onClick={() => handleReviewAction('yelp')}
                    className="w-full p-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl flex items-center gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 12.013l3.234 2.394a.8.8 0 0 0 1.24-.672l.228-1.39a.8.8 0 0 0-.287-.849L13.25 9.525a.8.8 0 0 0-1.233.697v1.791z"/>
                        <path d="M12.017 12.013l-3.234 2.394a.8.8 0 0 1-1.24-.672l-.228-1.39a.8.8 0 0 1 .287-.849l3.182-1.971a.8.8 0 0 1 1.233.697v1.791z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Leave Yelp Review</div>
                      <div className="text-sm text-text-secondary">Share your experience</div>
                    </div>
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Add to Wallet */}
                <button
                  onClick={() => handleReviewAction('wallet')}
                  className="w-full p-4 bg-glass hover:bg-glass-border border border-glass-border rounded-xl flex items-center gap-4 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Add to Wallet</div>
                    <div className="text-sm text-text-secondary">One-tap repeat next time</div>
                  </div>
                  <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Skip */}
                <button
                  onClick={() => handleReviewAction('skip')}
                  className="w-full p-3 text-text-secondary hover:text-text-primary transition-colors text-center"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Complete */}
        {currentStep === "complete" && (
          <motion.div
            key="complete"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen flex flex-col justify-center px-4"
          >
            <div className="max-w-md mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>

              <h2 className="text-3xl font-bold mb-4">Thank you!</h2>
              <p className="text-text-secondary mb-8">
                Your ${selectedAmount} tip to {worker.name} has been sent successfully.
              </p>

              <div className="space-y-3">
                <button
                  onClick={startOver}
                  className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end rounded-xl text-white font-medium"
                >
                  Send Another Tip
                </button>
                
                <button
                  onClick={() => setLocation('/')}
                  className="w-full py-3 bg-glass border border-glass-border rounded-xl text-text-primary font-medium hover:bg-glass-border transition-colors"
                >
                  Explore TipLink
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}