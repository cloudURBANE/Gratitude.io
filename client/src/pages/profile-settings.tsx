import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  venmoHandle: z.string().max(50).optional(),
  cashappHandle: z.string().max(50).optional(),
  zelleInfo: z.string().max(100).optional(),
  googleReviewUrl: z.string().url().optional().or(z.literal("")),
  yelpReviewUrl: z.string().url().optional().or(z.literal("")),
});

type ProfileData = z.infer<typeof profileSchema>;

interface Worker {
  id: string;
  name: string;
  role: string;
  location: string;
  handle: string;
  avatarUrl?: string;
  venmoHandle?: string;
  cashappHandle?: string;
  zelleInfo?: string;
  googleReviewUrl?: string;
  yelpReviewUrl?: string;
}

export default function ProfileSettings() {
  const { handle } = useParams<{ handle: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'basic' | 'payments' | 'reviews'>('basic');

  const { data: worker, isLoading } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle && handle !== 'demo',
  });

  // Demo data for 'demo' handle
  const demoWorker: Worker = {
    id: 'demo-id',
    name: 'Jordan M.',
    role: 'Barista & Shift Lead',
    location: 'Seattle, WA',
    handle: 'demo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150',
    venmoHandle: 'jordan-coffee',
    cashappHandle: 'jordanbarista',
    zelleInfo: 'jordan@coffee.com',
    googleReviewUrl: 'https://g.page/demo',
    yelpReviewUrl: 'https://yelp.com/demo',
  };

  const displayWorker = handle === 'demo' ? demoWorker : worker;

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: displayWorker?.name || '',
      role: displayWorker?.role || '',
      location: displayWorker?.location || '',
      avatarUrl: displayWorker?.avatarUrl || '',
      venmoHandle: displayWorker?.venmoHandle || '',
      cashappHandle: displayWorker?.cashappHandle || '',
      zelleInfo: displayWorker?.zelleInfo || '',
      googleReviewUrl: displayWorker?.googleReviewUrl || '',
      yelpReviewUrl: displayWorker?.yelpReviewUrl || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      if (handle === 'demo') {
        // Simulate API call for demo
        return new Promise(resolve => setTimeout(resolve, 1000));
      }
      return await apiRequest("PUT", `/api/workers/${displayWorker?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers", handle] });
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!displayWorker) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Worker Not Found</h1>
          <p className="text-text-secondary mb-6">Profile settings not available.</p>
        </GlassCard>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'payments', label: 'Payment Methods', icon: '💳' },
    { id: 'reviews', label: 'Review Links', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
          <p className="text-text-secondary">Manage your profile information and payment methods</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-accent-start to-accent-end text-white'
                        : 'text-text-primary hover:bg-glass-border'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </GlassCard>

            {/* Profile Preview */}
            <GlassCard className="p-6 mt-6">
              <div className="text-center">
                <img 
                  src={form.watch('avatarUrl') || displayWorker.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-glass-border" 
                />
                <div className="text-lg font-semibold text-text-primary">{form.watch('name') || displayWorker.name}</div>
                <div className="text-sm text-text-secondary">{form.watch('role') || displayWorker.role}</div>
                {(form.watch('location') || displayWorker.location) && (
                  <div className="text-xs text-text-secondary mt-1">{form.watch('location') || displayWorker.location}</div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <GlassCard className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title/Role</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Barista, Server, Driver" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Seattle, WA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Photo URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/photo.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-text-primary mb-4">Payment Methods</h2>
                      <p className="text-text-secondary mb-6">Add your payment handles so customers can tip you through multiple platforms.</p>
                      
                      <FormField
                        control={form.control}
                        name="venmoHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-blue-500">📱</span>
                              Venmo Handle
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">@</span>
                                <Input placeholder="your-venmo-handle" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cashappHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-green-500">💚</span>
                              Cash App Handle
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                                <Input placeholder="your-cashapp-handle" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zelleInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-purple-500">🏦</span>
                              Zelle Email/Phone
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="your-email@example.com or phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-400">ℹ️</span>
                          <span className="font-semibold text-text-primary">Payment Method Tips</span>
                        </div>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• Stripe (card payments) typically receive 23% higher tips</li>
                          <li>• Multiple payment options increase conversion rates by 15%</li>
                          <li>• Venmo and Cash App are popular with younger customers</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-text-primary mb-4">Review Links</h2>
                      <p className="text-text-secondary mb-6">Add links to your Google and Yelp profiles to encourage reviews.</p>
                      
                      <FormField
                        control={form.control}
                        name="googleReviewUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-blue-500">🔍</span>
                              Google Review Link
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://g.page/your-business" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yelpReviewUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <span className="text-red-500">⭐</span>
                              Yelp Review Link
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://yelp.com/your-business" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-400">💡</span>
                          <span className="font-semibold text-text-primary">Review Strategy</span>
                        </div>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• Reviews build trust and increase tip conversion rates</li>
                          <li>• Ask satisfied customers to leave reviews after tipping</li>
                          <li>• Positive reviews can increase earnings by up to 30%</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <GradientButton
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </GradientButton>
                    
                    <button
                      type="button"
                      onClick={() => form.reset()}
                      className="px-6 py-3 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </Form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}