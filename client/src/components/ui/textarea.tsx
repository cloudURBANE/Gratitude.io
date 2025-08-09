import { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-glass-border bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-start focus:outline-none focus:ring-2 focus:ring-accent-start focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };