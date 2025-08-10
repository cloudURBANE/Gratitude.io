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
    const handleUnauthorized = () => {
      toast({
        title: "Session Expired",
        description: "You have been logged out. Redirecting to login...",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    };

    // Listen for fetch errors globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 401) {
          handleUnauthorized();
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