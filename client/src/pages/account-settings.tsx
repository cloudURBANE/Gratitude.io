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
  Smartphone, Zap, Star, CheckCircle, AlertCircle, Eye, EyeOff,
  User, Target, Wallet, Sparkles, Mail, Lock, Globe, Trash2
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    handle: '',
    jobTitle: '',
    workplace: '',
    bio: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: false,
    autoWithdraw: false,
    withdrawThreshold: 50
  });

  const [showPassword, setShowPassword] = useState(false);

  // Queries
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  const userStats = {
    totalEarnings: '1,247.50',
    thisMonth: '342.80',
    totalTips: '89',
    avgTip: '12.45'
  };

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return await apiRequest('PUT', '/api/auth/user', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      navigate('/');
      queryClient.clear();
    }
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        handle: user.handle || '',
        jobTitle: user.jobTitle || '',
        workplace: user.workplace || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleSettingsUpdate = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const planBadge = user?.plan === 'pro' ? (
    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  ) : (
    <Badge variant="outline" className="border-gray-600 text-gray-400">
      Free
    </Badge>
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p>Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* TipVault Header with glassmorphism design */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Account Settings
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white/60 text-sm">Current Plan:</span>
                    {planBadge}
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Premium Features Available</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all backdrop-blur-sm"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* TipVault Glassmorphism Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <TabsList className="relative grid w-full grid-cols-3 lg:grid-cols-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-2 h-auto">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="earnings" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-xs font-medium">Earnings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Alerts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <Crown className="w-5 h-5" />
                <span className="text-xs font-medium">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="flex flex-col gap-1 py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all rounded-xl"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs font-medium">Tools</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
                <CardHeader className="pb-6">
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
                      <User className="w-6 h-6 text-green-400" />
                    </div>
                    Personal Information
                    <Badge variant="outline" className="ml-auto border-green-500/50 text-green-400 bg-green-500/10">
                      Verified
                    </Badge>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Manage your profile details and tip page settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white/80 font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white/80 font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="handle" className="text-white/80 font-medium">Tip Page Handle</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">tipvault.com/u/</span>
                        <Input
                          id="handle"
                          value={profileData.handle}
                          onChange={(e) => setProfileData(prev => ({ ...prev, handle: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors pl-32"
                          placeholder="your-handle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle" className="text-white/80 font-medium">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                          placeholder="Server, Barista, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workplace" className="text-white/80 font-medium">Workplace</Label>
                        <Input
                          id="workplace"
                          value={profileData.workplace}
                          onChange={(e) => setProfileData(prev => ({ ...prev, workplace: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 transition-colors"
                          placeholder="Restaurant/Business Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white/80 font-medium">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full min-h-[100px] px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-green-400 transition-colors resize-none"
                        placeholder="Tell customers about yourself and your service..."
                        maxLength={500}
                      />
                      <div className="text-xs text-white/50 text-right">
                        {profileData.bio.length}/500 characters
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving Changes...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Profile Changes
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Goals Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                      Tip Goals & Optimization
                    </CardTitle>
                    <p className="text-white/60 text-sm">Set targets to maximize your earnings</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Daily Goal ($)</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Weekly Goal ($)</Label>
                      <Input
                        type="number"
                        placeholder="350"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <div className="text-green-400 font-medium text-sm mb-2">💡 AI Insight</div>
                      <p className="text-xs text-white/70">
                        You earn 23% more on weekends. Consider adjusting your schedule for maximum earnings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Withdrawals Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                        <Wallet className="w-6 h-6 text-blue-400" />
                      </div>
                      Instant Withdrawals
                    </CardTitle>
                    <p className="text-white/60 text-sm">Configure automatic payouts</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white/80">Auto-Withdraw</Label>
                        <p className="text-xs text-white/50">Automatically transfer earnings</p>
                      </div>
                      <Switch
                        checked={settings.autoWithdraw}
                        onCheckedChange={(checked) => handleSettingsUpdate({ autoWithdraw: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Withdrawal Threshold ($)</Label>
                      <Input
                        type="number"
                        value={settings.withdrawThreshold}
                        onChange={(e) => handleSettingsUpdate({ withdrawThreshold: parseInt(e.target.value) || 50 })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">Payment Method</Label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white">
                        <option value="">Select method...</option>
                        <option value="bank">Bank Account (1-2 days)</option>
                        <option value="paypal">PayPal (Instant)</option>
                        <option value="crypto">Crypto Wallet (Instant)</option>
                      </select>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Connect Payment Method
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-blue-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-green-500 to-blue-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-green-500/20">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    Real-Time Earnings Dashboard
                    <Badge className="ml-auto bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                      Live Data
                    </Badge>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Track your performance and optimize earnings</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        ${userStats?.totalEarnings || '0.00'}
                      </div>
                      <div className="text-sm text-white/60">Total Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        ${userStats?.thisMonth || '0.00'}
                      </div>
                      <div className="text-sm text-white/60">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {userStats?.totalTips || '0'}
                      </div>
                      <div className="text-sm text-white/60">Tips Received</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        ${userStats?.avgTip || '0.00'}
                      </div>
                      <div className="text-sm text-white/60">Avg Tip</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                      <div className="text-green-400 font-semibold">Peak Hours</div>
                      <div className="text-sm text-white/70">2PM - 6PM • $67/hr avg</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                      <div className="text-blue-400 font-semibold">Best Day</div>
                      <div className="text-sm text-white/70">Fridays • $89 average</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                      <div className="text-purple-400 font-semibold">Conversion Rate</div>
                      <div className="text-sm text-white/70">73% customers tip</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                      <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    Smart Notifications
                    <Badge variant="outline" className="ml-auto border-blue-500/50 text-blue-400 bg-blue-500/10">
                      Real-time
                    </Badge>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Configure your notification preferences</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white/80 font-medium">Instant Tip Alerts</Label>
                      <p className="text-xs text-white/50">Get notified immediately when you receive tips</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingsUpdate({ emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white/80 font-medium">Daily Earnings Summary</Label>
                      <p className="text-xs text-white/50">End-of-day performance and goal progress</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingsUpdate({ pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white/80 font-medium">AI Optimization Tips</Label>
                      <p className="text-xs text-white/50">Smart suggestions to boost your earnings</p>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white/80 font-medium">Public Profile Discovery</Label>
                      <p className="text-xs text-white/50">Allow customers to find and follow your profile</p>
                    </div>
                    <Switch
                      checked={settings.publicProfile}
                      onCheckedChange={(checked) => handleSettingsUpdate({ publicProfile: checked })}
                    />
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 font-medium text-sm mb-2">
                      <Crown className="w-4 h-4" />
                      Pro Feature
                    </div>
                    <p className="text-xs text-white/70">
                      Custom notification triggers: Set alerts for milestone tips, goal achievements, and peak earning hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20">
                      <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    Account Security
                    <Badge className="ml-auto bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                      Protected
                    </Badge>
                  </CardTitle>
                  <p className="text-white/60 text-sm">Manage your account security settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/80">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">New Password</Label>
                        <Input
                          type="password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Confirm New Password</Label>
                        <Input
                          type="password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80">Enable 2FA</p>
                        <p className="text-xs text-white/50">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      Danger Zone
                    </h3>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-400 font-medium text-sm mb-2">Delete Account</p>
                      <p className="text-xs text-white/70 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-xl" />
              <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                      <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                    Subscription Plan
                    {planBadge}
                  </CardTitle>
                  <p className="text-white/60 text-sm">Manage your TipVault subscription</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user?.plan === 'free' ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                        <h3 className="text-yellow-400 font-bold text-lg mb-2">Upgrade to Pro</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Unlock advanced features and maximize your earning potential
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Advanced Analytics
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Custom Branding
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Priority Support
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Multiple Tip Pages
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-xl">
                          Upgrade to Pro - $4.99/month
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
                        <h3 className="text-green-400 font-bold text-lg mb-2">Pro Plan Active</h3>
                        <p className="text-white/70 text-sm">
                          You're currently on the Pro plan. Next billing: January 15, 2025
                        </p>
                      </div>
                      <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20">
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl blur-lg" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl overflow-hidden hover:bg-black/50 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                      <QrCode className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">QR Generator</h3>
                    <p className="text-white/60 text-sm">Create custom QR codes for your tip page</p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl overflow-hidden hover:bg-black/50 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Analytics</h3>
                    <p className="text-white/60 text-sm">Deep insights into your earning patterns</p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg" />
                <Card className="relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-2xl overflow-hidden hover:bg-black/50 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Customer Reviews</h3>
                    <p className="text-white/60 text-sm">Manage and showcase customer feedback</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}