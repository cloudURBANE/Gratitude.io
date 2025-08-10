import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  plan: string | null;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // User is authenticated if we have user data and no error
  const isAuthenticated = !!user && !error;
  
  // Consider loading complete after first response (success or 401)
  const authCheckComplete = !isLoading || !!error;

  return {
    user: user || null,
    isLoading: !authCheckComplete,
    isAuthenticated,
    error,
  };
}