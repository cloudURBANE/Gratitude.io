import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { insertProfileSchema } from '@shared/schema';

type ProfileFormData = z.infer<typeof insertProfileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSuccess?: (profile: any) => void;
}

const profileFormSchema = insertProfileSchema.extend({
  confirmHandle: z.string().min(1, 'Please confirm your handle')
}).refine((data) => data.handle === data.confirmHandle, {
  message: "Handles don't match",
  path: ["confirmHandle"]
});

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData & { confirmHandle: string }>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      handle: initialData?.handle || '',
      confirmHandle: initialData?.handle || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      jobTitle: initialData?.jobTitle || '',
      venmoHandle: initialData?.venmoHandle || '',
      cashappHandle: initialData?.cashappHandle || '',
      zelleHandle: initialData?.zelleHandle || '',
      avatarUrl: initialData?.avatarUrl || ''
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest('POST', '/api/profiles', data),
    onSuccess: (newProfile) => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile created successfully!",
        description: "Your tip page is now live and ready to receive tips."
      });
      onSuccess?.(newProfile);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: ProfileFormData & { confirmHandle: string }) => {
    setIsSubmitting(true);
    try {
      const { confirmHandle, ...profileData } = data;
      await createProfileMutation.mutateAsync(profileData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateHandle = () => {
    const name = form.getValues('name');
    if (name) {
      const handle = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .substring(0, 20);
      form.setValue('handle', handle);
      form.setValue('confirmHandle', handle);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Your full name"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              {...form.register('jobTitle')}
              placeholder="e.g., Server, Barista, Driver"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="City, State"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Tell people about yourself and your work..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Handle Setup */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="handle">Tip Page Handle *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateHandle}
              disabled={!form.getValues('name')}
            >
              Generate from Name
            </Button>
          </div>
          
          <div>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-l-md">
                tipvault.com/u/
              </span>
              <Input
                id="handle"
                {...form.register('handle')}
                placeholder="yourname"
                className="rounded-l-none"
              />
            </div>
            {form.formState.errors.handle && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.handle.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmHandle">Confirm Handle *</Label>
            <Input
              id="confirmHandle"
              {...form.register('confirmHandle')}
              placeholder="Type your handle again"
              className="mt-1"
            />
            {form.formState.errors.confirmHandle && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.confirmHandle.message}
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your payment handles so customers can tip you directly
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="venmoHandle">Venmo Handle</Label>
              <Input
                id="venmoHandle"
                {...form.register('venmoHandle')}
                placeholder="@username"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cashappHandle">Cash App Handle</Label>
              <Input
                id="cashappHandle"
                {...form.register('cashappHandle')}
                placeholder="$username"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="zelleHandle">Zelle Email/Phone</Label>
              <Input
                id="zelleHandle"
                {...form.register('zelleHandle')}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || createProfileMutation.isPending}
            className="flex-1"
          >
            {isSubmitting || createProfileMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating Profile...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Tip Page
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}