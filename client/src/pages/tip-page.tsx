import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Star, Coffee, Zap, DollarSign } from 'lucide-react';
import { HoldToTip } from '@/components/HoldToTip';
import { SmartDock } from '@/components/SmartDock';

export default function TipPage() {
  const [match, params] = useRoute('/u/:handle');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [showPaymentDock, setShowPaymentDock] = useState(false);
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/profiles', params?.handle],
    queryFn: () => fetch(`/api/profiles/${params?.handle}`).then(res => {
      if (!res.ok) throw new Error('Profile not found');
      return res.json();
    }),
    enabled: !!params?.handle
  });

  if (isLoading) {
    return (
      <PageContainer className="text-center">
        <div className="space-y-4 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer className="text-center">
        <div className="space-y-4">
          <div className="text-6xl">😵</div>
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">
            This tip page doesn't exist or has been deactivated.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleAmountSelected = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentDock(true);
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <Card className="p-6 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <div className="space-y-4">
            <Avatar className="w-20 h-20 mx-auto">
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {profile.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Badge variant="secondary" className="font-medium">
                  {profile.role}
                </Badge>
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin size={14} />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </Card>

        {/* Hold-to-Tip Interface */}
        <Card className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Show Your Appreciation</h2>
            <p className="text-sm text-muted-foreground">
              Hold and drag to select your tip amount
            </p>
          </div>
          
          <HoldToTip 
            onAmountSelected={handleAmountSelected}
            className="mb-6"
          />
          
          {selectedAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-2xl font-bold text-green-600">
                ${selectedAmount.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Your tip will help {profile.name.split(' ')[0]} continue providing great service!
              </p>
            </motion.div>
          )}
        </Card>

        {/* Payment Dock */}
        {showPaymentDock && selectedAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SmartDock 
              amount={selectedAmount}
              profile={profile}
              onPaymentInitiated={(method) => {
                console.log(`Payment initiated: ${method} for $${selectedAmount}`);
              }}
            />
          </motion.div>
        )}

        {/* Quick Tip Options */}
        {!showPaymentDock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {[3, 5, 10].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="lg"
                className="h-16 flex flex-col gap-1 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all"
                onClick={() => handleAmountSelected(amount)}
              >
                <DollarSign size={20} />
                <span className="font-semibold">${amount}</span>
              </Button>
            ))}
          </motion.div>
        )}

        {/* Reviews Section */}
        <Card className="p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="text-sm font-medium">Leave a Review</span>
            </div>
            <div className="flex gap-2">
              {profile.google_review_url && (
                <Button size="sm" variant="ghost" className="text-xs">
                  Google
                </Button>
              )}
              {profile.yelp_review_url && (
                <Button size="sm" variant="ghost" className="text-xs">
                  Yelp
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </PageContainer>
  );
}