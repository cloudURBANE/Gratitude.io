import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PaymentVerificationProps {
  tipId: string;
  amount: number;
  paymentMethod: string;
  onVerified?: () => void;
  onTimeout?: () => void;
}

export function PaymentVerification({ 
  tipId, 
  amount, 
  paymentMethod, 
  onVerified, 
  onTimeout 
}: PaymentVerificationProps) {
  const [status, setStatus] = useState<'pending' | 'verified' | 'failed' | 'timeout'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyPaymentMutation = useMutation({
    mutationFn: (confirmationData: any) => 
      apiRequest('POST', `/api/tips/${tipId}/verify`, confirmationData),
    onSuccess: () => {
      setStatus('verified');
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
      toast({
        title: "Payment Verified!",
        description: "Thank you for your tip. The service worker has been notified."
      });
      onVerified?.();
    },
    onError: () => {
      setStatus('failed');
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your payment. Please check your payment app.",
        variant: "destructive"
      });
    }
  });

  // Countdown timer
  useEffect(() => {
    if (status !== 'pending') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('timeout');
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onTimeout]);

  // Auto-verify for Stripe payments (would be webhook in production)
  useEffect(() => {
    if (paymentMethod === 'stripe') {
      // Simulate stripe webhook verification
      const timer = setTimeout(() => {
        verifyPaymentMutation.mutate({ verified: true, method: 'stripe' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentMethod]);

  const handleManualVerification = (verified: boolean) => {
    verifyPaymentMutation.mutate({ 
      verified, 
      method: paymentMethod,
      manualConfirmation: true 
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'failed':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'timeout':
        return <Clock className="w-12 h-12 text-orange-500" />;
      default:
        return (
          <div className="relative">
            <Clock className="w-12 h-12 text-blue-500" />
            <div className="absolute inset-0 animate-spin">
              <div className="w-12 h-12 border-2 border-blue-200 border-t-blue-500 rounded-full" />
            </div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'verified':
        return {
          title: 'Payment Verified!',
          description: 'Your tip has been successfully processed and the worker has been notified.',
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Verification Failed',
          description: 'We couldn\'t verify your payment. Please check your payment app and try again.',
          color: 'text-red-600'
        };
      case 'timeout':
        return {
          title: 'Verification Timeout',
          description: 'Payment verification timed out. You can manually confirm if you completed the payment.',
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Verifying Payment...',
          description: paymentMethod === 'stripe' 
            ? 'Processing your credit card payment securely...'
            : 'Please complete the payment in your app and return here for confirmation.',
          color: 'text-blue-600'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        {/* Status Icon */}
        <div className="flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h3 className={`text-xl font-semibold ${statusMessage.color}`}>
            {statusMessage.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {statusMessage.description}
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">${amount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Method:</span>
            <Badge variant="outline" className="capitalize">
              <CreditCard className="w-3 h-3 mr-1" />
              {paymentMethod}
            </Badge>
          </div>
          {status === 'pending' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Time left:</span>
              <span className="text-sm font-mono text-blue-600">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {status === 'pending' && paymentMethod !== 'stripe' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Did you complete the payment in your {paymentMethod} app?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleManualVerification(true)}
                disabled={verifyPaymentMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Yes, I Paid
              </Button>
              <Button
                onClick={() => handleManualVerification(false)}
                disabled={verifyPaymentMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {(status === 'timeout' || status === 'failed') && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you completed the payment, please confirm below:
            </p>
            <Button
              onClick={() => handleManualVerification(true)}
              disabled={verifyPaymentMutation.isPending}
              className="w-full"
            >
              I Completed the Payment
            </Button>
          </div>
        )}
      </motion.div>
    </Card>
  );
}