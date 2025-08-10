import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
    .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
    .refine((password) => /[0-9]/.test(password), 'Password must contain at least one number'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .refine((name) => /^[a-zA-Z\s]+$/.test(name), 'First name can only contain letters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .refine((name) => /^[a-zA-Z\s]+$/.test(name), 'Last name can only contain letters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      setIsSubmitting(true);
      console.log('🚀 Submitting signup data:', data);
      
      try {
        const response = await apiRequest('POST', '/api/auth/signup', data);
        const result = await response.json();
        console.log('✅ Signup response:', result);
        return result;
      } catch (error) {
        console.error('❌ Signup request failed:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Signup successful:', data);
      
      // Store the authentication token
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
        console.log('🔑 Token stored successfully');
      }
      
      toast({
        title: 'Welcome to TipVault!',
        description: 'Your account has been created successfully.',
        duration: 3000,
      });
      
      // Force refetch user data and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        setLocation('/profile-setup');
      }, 1000);
    },
    onError: (error: any) => {
      console.error('💥 Signup error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      // Parse different error types
      if (error.message.includes('409')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Please check your information and try again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
      
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: SignupForm) => {
    console.log('📝 Form submitted with data:', data);
    console.log('🔍 Form errors:', form.formState.errors);
    
    // Prevent double submission
    if (isSubmitting || signupMutation.isPending) {
      console.log('⏳ Already submitting, ignoring...');
      return;
    }
    
    // Validate form one more time
    const validation = signupSchema.safeParse(data);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error);
      return;
    }
    
    console.log('✅ Validation passed, submitting...');
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">TipVault</h1>
          </div>
          <CardTitle className="text-white">Create your account</CardTitle>
          <CardDescription className="text-gray-400">
            Join TipVault and start optimizing your tips today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John"
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={signupMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Doe"
                          className="bg-slate-700 border-slate-600 text-white"
                          disabled={signupMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="bg-slate-700 border-slate-600 text-white"
                        disabled={signupMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Create a strong password"
                        className="bg-slate-700 border-slate-600 text-white"
                        disabled={signupMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 transition-all duration-200"
                disabled={signupMutation.isPending || isSubmitting}
              >
                {signupMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}