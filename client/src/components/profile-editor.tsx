import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";

interface ProfileEditorProps {
  worker: {
    id: string;
    name: string;
    role: string;
    location: string;
    handle: string;
    avatarUrl?: string;
    venmoHandle?: string;
    cashappHandle?: string;
    zelleHandle?: string;
    googleReviewUrl?: string;
    yelpReviewUrl?: string;
  };
  onClose: () => void;
}

export default function ProfileEditor({ worker, onClose }: ProfileEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: worker.name || '',
    role: worker.role || '',
    location: worker.location || '',
    avatarUrl: worker.avatarUrl || '',
    venmoHandle: worker.venmoHandle || '',
    cashappHandle: worker.cashappHandle || '',
    zelleHandle: worker.zelleHandle || '',
    googleReviewUrl: worker.googleReviewUrl || '',
    yelpReviewUrl: worker.yelpReviewUrl || '',
  });

  const updateWorkerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/workers/${worker.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkerMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-glass-border transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Role/Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="e.g., Server, Barista"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="Restaurant name or location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => handleChange('avatarUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Payment Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Venmo Handle
                </label>
                <input
                  type="text"
                  value={formData.venmoHandle}
                  onChange={(e) => handleChange('venmoHandle', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Cash App Handle
                </label>
                <input
                  type="text"
                  value={formData.cashappHandle}
                  onChange={(e) => handleChange('cashappHandle', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="$username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Zelle Email/Phone
                </label>
                <input
                  type="text"
                  value={formData.zelleHandle}
                  onChange={(e) => handleChange('zelleHandle', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Review Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Review Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Google Review URL
                </label>
                <input
                  type="url"
                  value={formData.googleReviewUrl}
                  onChange={(e) => handleChange('googleReviewUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="https://g.page/r/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Yelp Review URL
                </label>
                <input
                  type="url"
                  value={formData.yelpReviewUrl}
                  onChange={(e) => handleChange('yelpReviewUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-start focus:border-transparent transition-all"
                  placeholder="https://www.yelp.com/writeareview/biz/..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <GradientButton 
              type="submit"
              className="flex-1 py-3"
              disabled={updateWorkerMutation.isPending}
            >
              {updateWorkerMutation.isPending ? 'Saving...' : 'Save Changes'}
            </GradientButton>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-glass hover:bg-glass-border border border-glass-border rounded-lg text-text-primary transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}