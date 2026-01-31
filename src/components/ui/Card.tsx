import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button'; // Re-use cn utility

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverable = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'card',
                    hoverable && 'card-interactive',
                    'p-6',
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

export { Card };
