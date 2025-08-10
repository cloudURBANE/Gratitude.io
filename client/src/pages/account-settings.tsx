import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  ArrowLeft, Save, DollarSign, BarChart3, QrCode, Settings, 
  CreditCard, Bell, Shield, Crown, TrendingUp, Users, 
  Smartphone, Zap, Star, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  publicProfile: boolean;
  autoWithdraw: boolean;
  withdrawThreshold: number;
  preferredPaymentMethod: string;
  tipGoals: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export default function AccountSettings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    handle: '',
    jobTitle: '',
    workplace: '',
    bio: '',
    profileImageUrl: '',
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    autoWithdraw: false,
    withdrawThreshold: 100,
    preferredPaymentMethod: 'stripe',
    tipGoals: {
      daily: 50,
      weekly: 350,
      monthly: 1500,
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/analytics/stats'],
    enabled: !!user,
  });

  const { data: currentPlan } = useQuery({
    queryKey: ['/api/subscription/current'],
    enabled: !!user,
  });

  // Load user data into forms
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        handle: user.handle || '',
        jobTitle: user.jobTitle || '',
        workplace: user.workplace || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated!',
        description: 'Your profile changes have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: UserSettings) => {
      const response = await apiRequest('PUT', '/api/auth/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated!',
        description: 'Your preferences have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('auth-token');
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleSettingsUpdate = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    updateSettingsMutation.mutate(updated);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const planBadge = currentPlan?.plan === 'pro' ? (
    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  ) : (
    <Badge variant="outline" className="border-gray-600 text-gray-400">
      Free
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400">Plan:</span>
                {planBadge}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-black/40 border border-gray-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-green-600">
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-green-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-green-600">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-green-600">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-green-600">
              <Crown className="w-4 h-4 mr-2" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-green-600">
              <Zap className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="handle" className="text-gray-300">Tip Page Handle</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-900 text-gray-400 text-sm">
                        tipvault.com/u/
                      </span>
                      <Input
                        id="handle"
                        value={profileData.handle}
                        onChange={(e) => setProfileData({ ...profileData, handle: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                        className="bg-gray-900 border-gray-700 text-white rounded-l-none"
                        placeholder="yourhandle"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobTitle" className="text-gray-300">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g. Server, Barista, Driver"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workplace" className="text-gray-300">Workplace</Label>
                      <Input
                        id="workplace"
                        value={profileData.workplace}
                        onChange={(e) => setProfileData({ ...profileData, workplace: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g. Downtown Cafe, Restaurant Name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white resize-none"
                      rows={3}
                      placeholder="Tell customers about yourself and why you deserve great tips!"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {profileData.bio.length}/500 characters
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Tip Goals & Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Daily Goal ($)</Label>
                    <Input
                      type="number"
                      value={settings.tipGoals.daily}
                      onChange={(e) => handleSettingsUpdate({
                        tipGoals: { ...settings.tipGoals, daily: Number(e.target.value) }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Weekly Goal ($)</Label>
                    <Input
                      type="number"
                      value={settings.tipGoals.weekly}
                      onChange={(e) => handleSettingsUpdate({
                        tipGoals: { ...settings.tipGoals, weekly: Number(e.target.value) }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      min="1"
                      max="5000"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Monthly Goal ($)</Label>
                    <Input
                      type="number"
                      value={settings.tipGoals.monthly}
                      onChange={(e) => handleSettingsUpdate({
                        tipGoals: { ...settings.tipGoals, monthly: Number(e.target.value) }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      min="1"
                      max="20000"
                    />
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <div className="text-green-400 font-medium text-sm">💡 Pro Tip</div>
                    <p className="text-xs text-gray-300 mt-1">
                      Workers with daily goals see 34% higher earnings. TipVault tracks your progress automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Instant Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Auto-Withdraw</Label>
                      <p className="text-xs text-gray-500">Get paid automatically when you hit your threshold</p>
                    </div>
                    <Switch
                      checked={settings.autoWithdraw}
                      onCheckedChange={(checked) => handleSettingsUpdate({ autoWithdraw: checked })}
                    />
                  </div>
                  
                  {settings.autoWithdraw && (
                    <div>
                      <Label className="text-gray-300">Withdrawal Threshold ($)</Label>
                      <Input
                        type="number"
                        value={settings.withdrawThreshold}
                        onChange={(e) => handleSettingsUpdate({ withdrawThreshold: Number(e.target.value) })}
                        className="bg-gray-900 border-gray-700 text-white"
                        min="25"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum $25 • Instant transfer available</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-300">Preferred Payment Method</Label>
                    <select
                      value={settings.preferredPaymentMethod}
                      onChange={(e) => handleSettingsUpdate({ preferredPaymentMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                    >
                      <option value="stripe">Bank Account (Same-day)</option>
                      <option value="paypal">PayPal (Instant)</option>
                      <option value="venmo">Venmo (Instant)</option>
                      <option value="crypto">Crypto Wallet (Instant)</option>
                    </select>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Connect Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Real-Time Earnings Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      ${userStats?.totalEarnings || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      ${userStats?.thisMonth || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {userStats?.totalTips || '0'}
                    </div>
                    <div className="text-sm text-gray-400">Tips Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      ${userStats?.avgTip || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">Avg Tip</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                    <div className="text-green-400 font-semibold">Peak Hours</div>
                    <div className="text-sm text-gray-300">2PM - 6PM • $67/hr avg</div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
                    <div className="text-blue-400 font-semibold">Best Day</div>
                    <div className="text-sm text-gray-300">Fridays • $89 average</div>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 text-center">
                    <div className="text-purple-400 font-semibold">Conversion Rate</div>
                    <div className="text-sm text-gray-300">73% customers tip</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Instant Tip Alerts</Label>
                    <p className="text-xs text-gray-500">Get notified immediately when you receive tips</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsUpdate({ emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Daily Earnings Summary</Label>
                    <p className="text-xs text-gray-500">End-of-day performance and goal progress</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingsUpdate({ pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Optimization Tips</Label>
                    <p className="text-xs text-gray-500">AI-powered suggestions to boost your earnings</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Public Profile Discovery</Label>
                    <p className="text-xs text-gray-500">Allow customers to find and follow your profile</p>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => handleSettingsUpdate({ publicProfile: checked })}
                  />
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <div className="text-yellow-400 font-medium text-sm">🚀 Pro Feature</div>
                  <p className="text-xs text-gray-300 mt-1">
                    Custom notification triggers: Set alerts for milestone tips, goal achievements, and peak earning hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-950/20 border border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-white font-medium">Account Verified</div>
                      <div className="text-xs text-gray-400">Bank-grade security enabled</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        className="bg-gray-900 border-gray-700 text-white pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">New Password</Label>
                    <Input
                      type="password"
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Update Password
                  </Button>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-white hover:bg-white/10"
                  >
                    Enable Two-Factor Authentication
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-white hover:bg-white/10"
                  >
                    Download Account Data
                  </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Danger Zone</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    Permanently Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6 mt-6">
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  TipVault Pro Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="mb-4">
                    {currentPlan?.plan === 'pro' ? (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        <span className="text-xl font-bold text-yellow-500">Pro Plan Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-gray-400" />
                        <span className="text-xl font-bold text-gray-400">Free Plan</span>
                      </div>
                    )}
                  </div>

                  {currentPlan?.plan === 'pro' ? (
                    <div className="space-y-2">
                      <p className="text-green-400">✓ Unlimited tip collection</p>
                      <p className="text-green-400">✓ Advanced earnings analytics</p>
                      <p className="text-green-400">✓ Custom branding & themes</p>
                      <p className="text-green-400">✓ Priority customer support</p>
                      <p className="text-green-400">✓ Instant withdrawal (0% fees)</p>
                      <p className="text-green-400">✓ AI earnings optimization</p>
                      <p className="text-gray-400 text-sm mt-4">
                        Next billing: {currentPlan?.nextBilling || 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-400">Basic tip collection</p>
                      <p className="text-gray-400">Limited analytics (last 30 days)</p>
                      <p className="text-red-400">✗ Custom branding</p>
                      <p className="text-red-400">✗ Priority support</p>
                      <p className="text-red-400">✗ Instant withdrawals (2.9% fee)</p>
                      <p className="text-red-400">✗ AI optimization</p>
                      
                      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-600/50 rounded-lg p-4 mt-4">
                        <div className="text-green-400 font-semibold">Upgrade Benefits</div>
                        <ul className="text-sm text-gray-300 mt-2 space-y-1">
                          <li>• Average 34% increase in tips</li>
                          <li>• $0 withdrawal fees (save $15-30/month)</li>
                          <li>• Peak hours analytics boost earnings</li>
                          <li>• Custom themes increase customer engagement</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link href="/pricing">
                      <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        {currentPlan?.plan === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro - $4.99/month'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-gray-800 hover:border-green-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Live Analytics</h3>
                  <p className="text-gray-400 text-sm mb-4">Real-time earnings tracking and performance insights</p>
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-green-600 hover:border-green-600">
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-blue-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <QrCode className="w-8 h-8 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Smart QR Codes</h3>
                  <p className="text-gray-400 text-sm mb-4">Generate trackable QR codes with analytics</p>
                  <Link href="/qr-generator">
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-blue-600 hover:border-blue-600">
                      Create QR Code
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-purple-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-8 h-8 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Mobile Tip Page</h3>
                  <p className="text-gray-400 text-sm mb-4">Customizable mobile-first tip collection page</p>
                  <Link href={`/u/${profileData.handle || 'preview'}`}>
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-purple-600 hover:border-purple-600">
                      View Your Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-yellow-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Team Management</h3>
                  <p className="text-gray-400 text-sm mb-4">Enterprise tools for businesses and teams</p>
                  <Link href="/business-dashboard">
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-yellow-600 hover:border-yellow-600">
                      Business Tools
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-orange-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">AI Optimization</h3>
                  <p className="text-gray-400 text-sm mb-4">Personalized tips to maximize your earnings</p>
                  <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-orange-600 hover:border-orange-600">
                    Get Insights
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-gray-800 hover:border-red-600 transition-colors group">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Quick Actions</h3>
                  <p className="text-gray-400 text-sm mb-4">One-click shortcuts for common tasks</p>
                  <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-red-600 hover:border-red-600">
                    Open Menu
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-600/30">
              <CardContent className="p-6 text-center">
                <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Unlock Your Full Earning Potential</h3>
                <p className="text-gray-300 mb-4">
                  Pro users earn 34% more tips on average with advanced analytics, custom branding, and instant withdrawals.
                </p>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600 font-semibold">
                    Upgrade to Pro - Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}