import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Global error handler for unauthorized requests
    const handleUnauthorized = (showToast = true) => {
      if (showToast) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
      }
      
      // Only redirect if we're on a protected route
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/dashboard', '/analytics', '/qr', '/settings', '/business'];
      const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
      
      if (isProtectedRoute) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    };

    // Enhanced fetch wrapper with better error handling
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Handle 401 responses
        if (response.status === 401) {
          const url = args[0]?.toString() || '';
          // Don't show toast for auth check endpoints
          const isAuthCheck = url.includes('/api/auth/user');
          handleUnauthorized(!isAuthCheck);
        }
        
        return response;
      } catch (error) {
        if (error instanceof Error && isUnauthorizedError(error)) {
          handleUnauthorized();
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [toast]);

  return <>{children}</>;
}