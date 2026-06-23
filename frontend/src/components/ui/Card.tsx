import React from 'react';
import type { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({ 
  className, 
  glass = false,
  hoverEffect = false,
  delay = 0,
  children, 
  style,
  ...props 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverEffect ? { y: -5, boxShadow: 'var(--shadow-md)' } : {}}
      className={cn(className)}
      style={{
        backgroundColor: glass ? 'var(--color-glass-bg)' : 'var(--color-card)',
        backdropFilter: glass ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(24px)' : 'none',
        border: glass ? '1px solid var(--color-glass-border)' : '1px solid rgba(61,44,46,0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: glass ? 'none' : 'var(--shadow-sm)',
        color: 'var(--color-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow var(--transition-normal), border var(--transition-normal)',
        ...style
      }}
      {...props as any}
    >
      {children}
    </motion.div>
  );
};

export default Card;
