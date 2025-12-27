import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'glass' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    style,
    ...props
}) => {
    const baseStyles = {
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative' as const,
    };

    const variants = {
        default: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
        },
        glass: {
            background: 'rgba(39, 39, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
        },
        outlined: {
            background: 'transparent',
            border: '1px solid var(--border-focus)',
        }
    };

    const paddings = {
        none: { padding: 0 },
        sm: { padding: '12px' },
        md: { padding: '24px' },
        lg: { padding: '32px' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                ...baseStyles,
                ...variants[variant],
                ...paddings[padding],
                ...style
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
