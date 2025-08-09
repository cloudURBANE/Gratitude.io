import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function PageContainer({ 
  children, 
  maxWidth = "max-w-md", 
  className 
}: PageContainerProps) {
  return (
    <div className={cn(
      "mx-auto px-4 py-6 min-h-screen",
      maxWidth,
      className
    )}>
      {children}
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {children}
    </div>
  );
}