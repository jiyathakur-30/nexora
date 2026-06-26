import React from 'react';
import { ArrowRight } from 'lucide-react';

// 1. Base Card Primitive
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  padding?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hoverEffect = true, 
  padding = 'var(--space-4)', 
  className = '', 
  style,
  ...props 
}) => {
  const cardClassName = `nexora-card ${hoverEffect ? 'nexora-card-hover' : ''} ${className}`;
  return (
    <div 
      className={cardClassName} 
      style={{ padding, ...style }} 
      {...props}
    >
      {children}
    </div>
  );
};

// 2. Section Header Primitive
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  style?: React.CSSProperties;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actionText, 
  onActionClick,
  style 
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)', ...style }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actionText && onActionClick && (
        <span onClick={onActionClick} className="nexora-link">
          {actionText} <ArrowRight size={14} />
        </span>
      )}
    </div>
  );
};

// 3. Metric Card Primitive (for KPIs)
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  helperText?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendDirection = 'neutral', 
  helperText,
  onClick
}) => {
  const trendColor = trendDirection === 'up' 
    ? 'var(--color-success)' 
    : trendDirection === 'down' 
      ? 'var(--color-danger)' 
      : 'var(--color-text-light)';

  return (
    <Card 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', minWidth: '180px', flex: 1 }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: trendColor }}>
            {trend}
          </span>
        )}
      </div>
      {helperText && (
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.3 }}>
          {helperText}
        </p>
      )}
    </Card>
  );
};

// 4. Action Card Primitive (for Conversational Mentor blocks)
interface ActionCardProps {
  title: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  badgeText?: string;
  metaText?: string;
  style?: React.CSSProperties;
}

export const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  ctaText, 
  onCtaClick, 
  badgeText,
  metaText,
  style
}) => {
  return (
    <Card hoverEffect style={{ border: '1px solid rgba(201, 106, 74, 0.15)', background: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h4>
        {badgeText && (
          <Badge variant="primary">{badgeText}</Badge>
        )}
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.45 }}>
        {description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
        {metaText ? (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
            {metaText}
          </span>
        ) : <div />}
        <button 
          onClick={onCtaClick}
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: '#white', 
            border: 'none', 
            borderRadius: 'var(--radius-sm)', 
            padding: '8px 16px', 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color var(--transition-fast)',
            color: '#FFFFFF'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
        >
          {ctaText} <ArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
};

// 5. Empty State Primitive
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onActionClick,
  style 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      padding: 'var(--space-6) var(--space-4)', 
      border: '1px dashed var(--color-border)', 
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'rgba(243, 236, 228, 0.15)',
      ...style 
    }}>
      {icon && <div style={{ marginBottom: '12px', color: 'var(--color-text-light)' }}>{icon}</div>}
      <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px', margin: 0 }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', maxWidth: '300px', marginBottom: actionText ? '12px' : '0px', margin: 0, lineHeight: 1.4 }}>
        {description}
      </p>
      {actionText && onActionClick && (
        <button 
          onClick={onActionClick}
          style={{ 
            color: 'var(--color-primary)', 
            backgroundColor: 'transparent',
            border: 'none', 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {actionText} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};

// 6. Badge Primitive
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'secondary', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'rgba(201, 106, 74, 0.08)', text: 'var(--color-primary)' };
      case 'success':
        return { bg: 'rgba(79, 143, 101, 0.08)', text: 'var(--color-success)' };
      case 'warning':
        return { bg: 'rgba(217, 140, 58, 0.08)', text: 'var(--color-warning)' };
      case 'danger':
        return { bg: 'rgba(192, 86, 86, 0.08)', text: 'var(--color-danger)' };
      case 'secondary':
      default:
        return { bg: 'rgba(122, 110, 96, 0.08)', text: 'var(--color-text-light)' };
    }
  };

  const { bg, text } = getColors();

  return (
    <span style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px', 
      borderRadius: '6px', 
      fontSize: '0.72rem', 
      fontWeight: 600, 
      backgroundColor: bg, 
      color: text, 
      letterSpacing: '0.01em',
      ...style 
    }}>
      {children}
    </span>
  );
};

// 7. Signature Roadmap Timeline Step
interface TimelineStepProps {
  label: string;
  value: string;
  active?: boolean;
  completed?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({ 
  label, 
  value, 
  active = false, 
  completed = false,
  isFirst = false,
  isLast = false
}) => {
  const dotColor = completed 
    ? 'var(--color-success)' 
    : active 
      ? 'var(--color-primary)' 
      : 'var(--color-border)';

  const labelColor = completed 
    ? 'var(--color-success)' 
    : active 
      ? 'var(--color-primary)' 
      : 'var(--color-text-light)';

  return (
    <div style={{ 
      position: 'relative', 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 8px'
    }}>
      {/* Horizontal Connector Line */}
      {!isFirst && (
        <div style={{ 
          position: 'absolute', 
          left: '-50%', 
          right: '50%', 
          top: '12px', 
          height: '2px', 
          backgroundColor: completed ? 'var(--color-success)' : 'var(--color-border)', 
          zIndex: 1 
        }} />
      )}
      
      {/* Node Circle */}
      <div style={{ 
        width: '24px', 
        height: '24px', 
        borderRadius: '50%', 
        backgroundColor: completed ? 'var(--color-success)' : '#FFFFFF',
        border: `2px solid ${dotColor}`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 2,
        color: '#FFFFFF',
        fontSize: '10px',
        fontWeight: 700,
        boxShadow: active ? '0 0 0 4px rgba(201, 106, 74, 0.15)' : 'none',
        transition: 'all var(--transition-normal)'
      }}>
        {completed ? '✓' : active ? '●' : ''}
      </div>

      <div style={{ marginTop: '12px', zIndex: 2 }}>
        <span style={{ 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: labelColor, 
          display: 'block', 
          marginBottom: '2px' 
        }}>
          {label}
        </span>
        <span style={{ 
          fontSize: '0.88rem', 
          fontWeight: 600, 
          color: 'var(--color-text)', 
          display: 'block',
          opacity: completed ? 0.75 : 1,
          textDecoration: completed ? 'line-through' : 'none'
        }}>
          {value}
        </span>
      </div>
    </div>
  );
};
