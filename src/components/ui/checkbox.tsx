import * as React from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Minimal native-checkbox component styled to match the shadcn aesthetic
 * used elsewhere in the app. Keeps form semantics simple — `checked`,
 * `onChange`, `required`, and `disabled` work as you'd expect.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 shrink-0 cursor-pointer rounded border border-input bg-background text-primary accent-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';
