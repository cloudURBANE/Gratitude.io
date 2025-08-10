import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  User, 
  AtSign,
  MessageSquare,
  Smartphone,
  QrCode,
  Star,
  ArrowRight,
  Check
} from 'lucide-react';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handle: '',
    bio: '',
    workplace: '',
    venmoHandle: '',
    cashappHandle: '',
    zelleEmail: ''
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
    // Save profile and redirect to dashboard
    console.log('Creating profile:', formData);
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to TipVault</h1>
            <p className="text-gray-300">Create your tip collection page in under 60 seconds</p>
          </motion.div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > num ? 'bg-purple-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Your Tip Page'}
              {step === 3 && 'Payment Methods'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="workplace" className="text-gray-300">Where do you work?</Label>
                  <Input
                    id="workplace"
                    value={formData.workplace}
                    onChange={(e) => handleInputChange('workplace', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Joe's Coffee Shop, Downtown Hotel, etc."
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="handle" className="text-gray-300">Your Tip Page Handle</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="handle"
                      value={formData.handle}
                      onChange={(e) => handleInputChange('handle', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="bg-white/10 border-white/20 text-white pl-10"
                      placeholder="johnsmith"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Your page will be: tipvault.com/u/{formData.handle || 'yourhandle'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-gray-300">Short Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-white/10 border-white/20 text-white resize-none"
                    placeholder="Friendly barista who loves making the perfect coffee! ☕"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="venmo" className="text-gray-300">Venmo Handle (Optional)</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="venmo"
                        value={formData.venmoHandle}
                        onChange={(e) => handleInputChange('venmoHandle', e.target.value)}
                        className="bg-white/10 border-white/20 text-white pl-10"
                        placeholder="john-smith"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cashapp" className="text-gray-300">Cash App Handle (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="cashapp"
                        value={formData.cashappHandle}
                        onChange={(e) => handleInputChange('cashappHandle', e.target.value)}
                        className="bg-white/10 border-white/20 text-white pl-10"
                        placeholder="johnsmith"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zelle" className="text-gray-300">Zelle Email (Optional)</Label>
                    <Input
                      id="zelle"
                      type="email"
                      value={formData.zelleEmail}
                      onChange={(e) => handleInputChange('zelleEmail', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="john@email.com"
                    />
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    💡 You can add more payment methods later. For now, just add what you have!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    disabled={!formData.firstName || (step === 2 && !formData.handle)}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={!formData.firstName || !formData.handle}
                  >
                    Create My Tip Page
                    <Star className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className="text-white text-lg font-semibold mb-4">What you'll get:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Badge variant="outline" className="border-purple-400 text-purple-300 p-3">
              <QrCode className="w-4 h-4 mr-2" />
              Instant QR Code
            </Badge>
            <Badge variant="outline" className="border-teal-400 text-teal-300 p-3">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile-Optimized
            </Badge>
            <Badge variant="outline" className="border-green-400 text-green-300 p-3">
              <DollarSign className="w-4 h-4 mr-2" />
              Start Earning Now
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}