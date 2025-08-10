import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  children = 'Sign In'
}: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleLogin}
      className={className}
    >
      <LogIn className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
}