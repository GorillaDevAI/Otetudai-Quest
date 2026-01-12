import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'colorful';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-3xl bg-card text-card-foreground shadow-xl border-2 border-slate-100',
                    variant === 'colorful' && 'border-none bg-gradient-to-br from-white to-blue-50',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';
