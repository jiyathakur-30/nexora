import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  style,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white border-none shadow-[var(--shadow-sm)]',
    secondary: 'bg-white text-[var(--color-text)] border border-[rgba(61,44,46,0.1)] shadow-[var(--shadow-sm)]',
    outline: 'border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent',
    ghost: 'bg-transparent text-[var(--color-text)] border-none'
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  return (
    <motion.button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)',
        ...getInlineStyles(variant, size),
        ...style
      }}
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

function getInlineStyles(variant: string, size: string): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  if (variant === 'primary') {
    styles.backgroundColor = 'var(--color-primary)';
    styles.color = '#fff';
    styles.border = 'none';
    styles.boxShadow = '0 4px 14px 0 rgba(201, 106, 74, 0.39)';
  } else if (variant === 'secondary') {
    styles.backgroundColor = '#fff';
    styles.color = 'var(--color-text)';
    styles.border = '1px solid rgba(61,44,46,0.1)';
    styles.boxShadow = '0 4px 14px 0 rgba(0,0,0,0.05)';
  } else if (variant === 'outline') {
    styles.backgroundColor = 'transparent';
    styles.color = 'var(--color-primary)';
    styles.border = '1.5px solid var(--color-primary)';
  } else if (variant === 'ghost') {
    styles.backgroundColor = 'transparent';
    styles.color = 'var(--color-text)';
    styles.border = 'none';
  }

  if (size === 'sm') {
    styles.height = '36px';
    styles.padding = '0 16px';
    styles.fontSize = '0.9rem';
  } else if (size === 'md') {
    styles.height = '44px';
    styles.padding = '0 24px';
    styles.fontSize = '1rem';
  } else if (size === 'lg') {
    styles.height = '56px';
    styles.padding = '0 32px';
    styles.fontSize = '1.1rem';
  }

  return styles;
}

export default Button;
