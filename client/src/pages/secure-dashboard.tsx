import { useEffect } from 'react';
import { useAuth, type AuthUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Settings, 
  LogOut,
  QrCode,
  BarChart3,
  DollarSign
} from 'lucide-react';

export default function SecureDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName || 'User'}!
          </h1>
          <p className="text-gray-400">
            Manage your TipVault account and tip pages
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Shield className="w-4 h-4 mr-2" />
            Authenticated
          </Badge>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email || 'User Account'
              }
            </h2>
            <p className="text-gray-400">{user.email}</p>
            <Badge variant="secondary" className="mt-2">
              {user.plan || 'Free'} Plan
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer">
          <QrCode className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Create Tip Page</h3>
          <p className="text-gray-400 text-sm">Set up your first tip collection page</p>
        </Card>
        
        <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer">
          <BarChart3 className="w-8 h-8 text-teal-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
          <p className="text-gray-400 text-sm">Track your earnings and performance</p>
        </Card>
        
        <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer">
          <Settings className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Account Settings</h3>
          <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No recent activity</p>
          <p className="text-gray-500 text-sm mt-2">
            Create your first tip page to start collecting tips
          </p>
        </div>
      </Card>
    </div>
  );
}