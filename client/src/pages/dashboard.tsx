import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  User, Settings, QrCode, BarChart3, DollarSign, TrendingUp, 
  Camera, Upload, ExternalLink, Copy, Check, Crown, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/monetization/AdSlot";
import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import ImageUploader from "@/components/image-uploader";
import QRCodeManager from "@/components/qr-code-manager";

interface UserData {
  id: string;
  name: string;
  email: string;
  handle?: string;
  avatarUrl?: string;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleHandle?: string;
  createdAt: string;
}

interface PaymentAccount {
  id: string;
  type: 'venmo' | 'cashapp' | 'zelle' | 'stripe';
  handle: string;
  verified: boolean;
  icon: string;
  name: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([
    { 
      id: '1', 
      type: 'venmo', 
      handle: '', 
      verified: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzNCN0ZCRiIvPgo8cGF0aCBkPSJNOCA2SDEwLjVMMTIgMTBMMTMuNSA2SDE2VjE4SDEzLjVWMTJMOSAxOEg2LjVWMTBMNy41IDZIOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=', 
      name: 'Venmo' 
    },
    { 
      id: '2', 
      type: 'cashapp', 
      handle: '', 
      verified: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwRDY4RiIvPgo8cGF0aCBkPSJNMTAgNkgxNEMxNS4xIDYgMTYgNi45IDE2IDhWMTZDMTYgMTcuMSAxNS4xIDE4IDE0IDE4SDEwQzguOSAxOCA4IDE3LjEgOCAxNlY4QzggNi45IDguOSA2IDEwIDZaTTEyIDhDMTAuOSA4IDEwIDguOSAxMCAxMFYxNEMxMCAxNS4xIDEwLjkgMTYgMTIgMTZDMTMuMSAxNiAxNCAxNS4xIDE0IDE0VjEwQzE0IDguOSAxMy4xIDggMTIgOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=', 
      name: 'Cash App' 
    },
    { 
      id: '3', 
      type: 'zelle', 
      handle: '', 
      verified: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzY5MzNCRCIvPgo8cGF0aCBkPSJNOCA2SDE2VjhIOUwxNiAxNlYxOEg4VjE2SDE1TDggOFY2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==', 
      name: 'Zelle' 
    },
    { 
      id: '4', 
      type: 'stripe', 
      handle: '', 
      verified: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzYzNTJGRiIvPgo8cGF0aCBkPSJNMTAuNSA5QzEwLjUgOC4xIDExLjEgNy41IDEyIDcuNUMxMi45IDcuNSAxMy41IDguMSAxMy41IDlDMTMuNSA5LjkgMTIuOSAxMC41IDEyIDEwLjVDMTEuMSAxMC41IDEwLjUgOS45IDEwLjUgOVpNOC41IDEyQzguNSAxMS4xIDkuMSAxMC41IDEwIDEwLjVDMTAuOSAxMC41IDExLjUgMTEuMSAxMS41IDEyVjEzLjVIMTAuNUMxMC4xIDEzLjUgOS43IDEzLjMgOS41IDEzQzEwIDEyLjQgMTAuNSAxMS45IDEwLjUgMTFDOS42IDExIDkgMTEuNiA5IDEyLjVDOSAxMy40IDkuNiAxNCA4IDEzLjhDNi40IDEzLjMgOC4xIDEyLjUgOC41IDEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==', 
      name: 'Stripe' 
    },
  ]);

  const [editForm, setEditForm] = useState({
    name: '',
    handle: '',
    venmoHandle: '',
    cashappHandle: '',
    zelleHandle: ''
  });

  // Mock stats data
  const stats = {
    totalTips: 2847.50,
    todayTips: 127.25,
    weekTips: 584.75,
    qrScans: 1234,
    conversionRate: 23.5,
    avgTip: 12.75
  };

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('tipvault-user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({
        name: parsedUser.name || '',
        handle: parsedUser.handle || parsedUser.name?.toLowerCase().replace(/\s+/g, '') || '',
        venmoHandle: parsedUser.venmoHandle || '',
        cashappHandle: parsedUser.cashappHandle || '',
        zelleHandle: parsedUser.zelleHandle || ''
      });
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('tipvault-user');
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    setLocation('/');
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...editForm
    };
    
    localStorage.setItem('tipvault-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    
    toast({
      title: "Profile updated!",
      description: "Your information has been saved successfully.",
    });
  };

  const handlePaymentAccountUpdate = (accountId: string, handle: string) => {
    setPaymentAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, handle, verified: handle.length > 0 }
          : account
      )
    );
  };

  const copyTipLink = () => {
    const tipLink = `${window.location.origin}/u/${editForm.handle || user?.handle || 'demo'}`;
    navigator.clipboard.writeText(tipLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Tip link copied!",
      description: "Share this link to start receiving tips",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (user) {
          const updatedUser = { ...user, avatarUrl: imageUrl };
          setUser(updatedUser);
          localStorage.setItem('tipvault-user', JSON.stringify(updatedUser));
          
          toast({
            title: "Profile photo updated!",
            description: "Your new photo looks great!",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  TipVault
                </h1>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300 text-sm font-medium">
                <Crown className="w-4 h-4" />
                Pro Account
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white font-semibold">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'profile', label: 'Profile Setup', icon: User },
                  { id: 'payments', label: 'Payment Accounts', icon: DollarSign },
                  { id: 'qr', label: 'QR & Links', icon: QrCode },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                  <div className="flex items-center gap-2 text-green-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Earning Active</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-8 h-8 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">ALL TIME</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">${stats.totalTips.toLocaleString()}</div>
                    <div className="text-gray-400">Total Tips Earned</div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">TODAY</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">${stats.todayTips}</div>
                    <div className="text-gray-400">Today's Earnings</div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <QrCode className="w-8 h-8 text-purple-400" />
                      <span className="text-xs text-purple-400 font-medium">SCANS</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.qrScans}</div>
                    <div className="text-gray-400">QR Code Scans</div>
                  </GlassCard>
                </div>

                {/* Quick Actions */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href={`/u/${user.handle || 'demo'}`}>
                      <button className="w-full flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-white hover:bg-green-500/20 transition-all">
                        <ExternalLink className="w-5 h-5 text-green-400" />
                        View Your Tip Page
                      </button>
                    </Link>
                    <button
                      onClick={copyTipLink}
                      className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-white hover:bg-blue-500/20 transition-all"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-blue-400" />}
                      {copied ? 'Copied!' : 'Copy Tip Link'}
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white">Profile Setup</h2>

                <GlassCard className="p-6">
                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="text-center">
                      <ImageUploader
                        currentImage={user.avatarUrl}
                        onImageChange={(imageUrl) => {
                          const updatedUser = { ...user, avatarUrl: imageUrl };
                          setUser(updatedUser);
                          localStorage.setItem('tipvault-user', JSON.stringify(updatedUser));
                          
                          toast({
                            title: "Profile photo updated!",
                            description: "Your new photo looks great!",
                          });
                        }}
                        size="lg"
                      />
                      <p className="text-gray-400 text-sm mt-2">Click to upload or drag & drop photo</p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                          placeholder="Your display name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username/Handle</label>
                        <input
                          type="text"
                          value={editForm.handle}
                          onChange={(e) => setEditForm(prev => ({ ...prev, handle: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                          placeholder="your-handle"
                        />
                        <p className="text-xs text-gray-400 mt-1">Your tip page: tipvault.com/u/{editForm.handle}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <GradientButton onClick={handleSaveProfile}>
                        Save Profile
                      </GradientButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-white">Payment Accounts</h2>
                  <div className="text-sm text-gray-400">
                    Connect your accounts to receive tips
                  </div>
                </div>

                <div className="grid gap-4">
                  {paymentAccounts.map(account => (
                    <GlassCard key={account.id} className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={account.icon} alt={account.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                            {account.verified && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Connected
                              </div>
                            )}
                          </div>
                          
                          <input
                            type="text"
                            value={account.handle}
                            onChange={(e) => handlePaymentAccountUpdate(account.id, e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder={
                              account.type === 'venmo' ? '@your-venmo-handle' :
                              account.type === 'cashapp' ? '$your-cashtag' :
                              account.type === 'zelle' ? 'your-email@example.com' :
                              'Connect Stripe account'
                            }
                          />
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="p-6 bg-blue-500/10 border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">💡</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Pro Tip</h3>
                      <p className="text-gray-300 text-sm">
                        Connect multiple payment methods to give customers more options. 
                        This can increase your tips by up to 40%!
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'qr' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <QRCodeManager 
                  handle={user.handle || 'demo'}
                  workerName={user.name}
                  onQRGenerated={(qrCode) => {
                    console.log('QR Code generated:', qrCode);
                  }}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Your QR Code</h3>
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center gap-2 justify-center py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        Download
                      </button>
                      <button className="flex-1 flex items-center gap-2 justify-center py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors">
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Share Your Link</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Your Tip Page URL</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={`${window.location.origin}/u/${editForm.handle || user.handle || 'demo'}`}
                            readOnly
                            className="flex-1 bg-gray-800/50 border border-gray-600 rounded-l-lg px-4 py-3 text-white"
                          />
                          <button
                            onClick={copyTipLink}
                            className="px-4 py-3 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-white hover:bg-blue-500/20 transition-all">
                          <span className="text-xl">📱</span>
                          Share on Social Media
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-all">
                          <span className="text-xl">📧</span>
                          Send via Email
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-white hover:bg-green-500/20 transition-all">
                          <span className="text-xl">💬</span>
                          Share via Text
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white">Settings</h2>

                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-medium">Email Notifications</div>
                        <div className="text-gray-400 text-sm">Receive tip notifications via email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-white font-medium">SMS Notifications</div>
                        <div className="text-gray-400 text-sm">Get instant SMS alerts for tips</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-white font-medium">Public Profile</div>
                        <div className="text-gray-400 text-sm">Make your profile discoverable</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <button className="w-full p-4 border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                      Delete Account
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}