import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'badge',
                    {
                        'badge-primary': variant === 'primary',
                        'bg-zinc-800 text-zinc-300 border border-zinc-700': variant === 'secondary',
                        'bg-transparent text-zinc-400 border border-zinc-700': variant === 'outline',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = 'Badge';

export { Badge };
