import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";

interface Worker {
  id: string;
  name: string;
  role: string;
  location?: string;
  handle: string;
  avatarUrl?: string;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleInfo?: string;
  stripeAccountId?: string;
  googleReviewUrl?: string;
  yelpReviewUrl?: string;
}

interface ProfileEditorProps {
  worker: Worker;
  onClose: () => void;
}

export default function ProfileEditor({ worker, onClose }: ProfileEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: worker.name || '',
    role: worker.role || '',
    location: worker.location || '',
    venmoHandle: worker.venmoHandle || '',
    cashappHandle: worker.cashappHandle || '',
    zelleInfo: worker.zelleInfo || '',
    googleReviewUrl: worker.googleReviewUrl || '',
    yelpReviewUrl: worker.yelpReviewUrl || '',
  });

  const updateWorkerMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return await apiRequest("PUT", `/api/workers/${worker.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers", worker.handle] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkerMutation.mutate(formData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <GlassCard className="rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-glass rounded-lg transition-colors focus-visible"
          >
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Display */}
          <div className="text-center">
            <img 
              src={worker.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
              alt="Profile avatar" 
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-glass-border" 
            />
            <button 
              type="button"
              className="text-sm text-accent-start hover:text-accent-end transition-colors focus-visible"
            >
              Change photo
            </button>
          </div>

          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
            <input 
              type="text" 
              className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
              value={formData.name}
              onChange={handleInputChange('name')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
            <input 
              type="text" 
              className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
              value={formData.role}
              onChange={handleInputChange('role')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
            <input 
              type="text" 
              className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
              value={formData.location}
              onChange={handleInputChange('location')}
              placeholder="City, State"
            />
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">Payment Methods</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Venmo Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">@</span>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border border-glass-border rounded-lg py-3 pl-8 pr-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
                    value={formData.venmoHandle}
                    onChange={handleInputChange('venmoHandle')}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Cash App Cashtag</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border border-glass-border rounded-lg py-3 pl-8 pr-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
                    value={formData.cashappHandle}
                    onChange={handleInputChange('cashappHandle')}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Zelle Email/Phone</label>
                <input 
                  type="text" 
                  className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
                  value={formData.zelleInfo}
                  onChange={handleInputChange('zelleInfo')}
                  placeholder="email@example.com or phone"
                />
              </div>
            </div>
          </div>

          {/* Review Links */}
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">Review Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Google Reviews</label>
                <input 
                  type="url" 
                  className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
                  value={formData.googleReviewUrl}
                  onChange={handleInputChange('googleReviewUrl')}
                  placeholder="https://g.page/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Yelp Reviews</label>
                <input 
                  type="url" 
                  className="w-full bg-transparent border border-glass-border rounded-lg py-3 px-4 text-text-primary placeholder-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20" 
                  value={formData.yelpReviewUrl}
                  onChange={handleInputChange('yelpReviewUrl')}
                  placeholder="https://yelp.com/..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <GradientButton
            type="submit"
            className="w-full py-3"
            disabled={updateWorkerMutation.isPending}
          >
            {updateWorkerMutation.isPending ? 'Saving...' : 'Save Changes'}
          </GradientButton>
        </form>
      </GlassCard>
    </div>
  );
}
