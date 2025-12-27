import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        transition: 'all 0.2s ease',
        gap: '8px',
        position: 'relative' as const,
    };

    const variants = {
        primary: {
            background: 'var(--primary)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
        secondary: {
            background: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
        },
        danger: {
            background: 'var(--danger)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        },
        success: {
            background: 'var(--success)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--border-focus)',
            color: 'var(--text-primary)',
        }
    };

    const sizes = {
        sm: { padding: '6px 12px', fontSize: '0.875rem' },
        md: { padding: '10px 20px', fontSize: '1rem' },
        lg: { padding: '14px 28px', fontSize: '1.125rem' },
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            style={{
                ...baseStyles,
                ...variants[variant],
                ...sizes[size],
                opacity: disabled || loading ? 0.6 : 1,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
            }}
            disabled={disabled || loading}
            className={className}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {!loading && icon}
            {children as any}
        </motion.button>
    );
};
