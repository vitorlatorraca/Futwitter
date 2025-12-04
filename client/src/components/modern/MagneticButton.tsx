/**
 * MagneticButton Component
 * 
 * A button with magnetic hover effect - follows the mouse slightly.
 * Modern styling with subtle glow on hover.
 */

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Magnetic pull strength
    const strength = 0.15;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    default: 'bg-[var(--theme-primary)] text-[var(--theme-text)] hover:opacity-90',
    ghost: 'bg-transparent text-[var(--theme-text)] hover:bg-[var(--theme-background-alt)]',
    outline: 'bg-transparent border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-background-alt)]',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Hover glow effect */}
      <motion.span
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: 'var(--theme-neon)',
          filter: 'blur(20px)',
        }}
        whileHover={{ opacity: 0.1 }}
      />
    </motion.button>
  );
}

