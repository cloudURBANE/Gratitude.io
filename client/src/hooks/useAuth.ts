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
  });

  // User is authenticated if we have user data and no 401 error
  const isAuthenticated = !!user && !error;

  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    error,
  };
}