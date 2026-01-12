import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

// Combine Framer Motion props with our custom props
type CombinedProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = forwardRef<HTMLButtonElement, CombinedProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-blue-500/30 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-orange-500/30 border-b-4 border-orange-600 active:border-b-0 active:translate-y-1',
            accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-green-500/30 border-b-4 border-green-700 active:border-b-0 active:translate-y-1',
            danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 border-b-4 border-red-800 active:border-b-0 active:translate-y-1',
            ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border-none shadow-none',
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm rounded-xl',
            md: 'h-11 px-6 text-base rounded-2xl',
            lg: 'h-14 px-8 text-lg rounded-2xl',
            xl: 'h-20 px-10 text-xl font-bold rounded-3xl',
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    'relative inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:pointer-events-none outline-none ring-offset-2 focus-visible:ring-2',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="animate-spin mr-2">⏳</span>
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
