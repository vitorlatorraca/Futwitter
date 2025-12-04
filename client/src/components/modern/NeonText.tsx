/**
 * NeonText Component
 * 
 * Text with neon glow effect on hover.
 * Letters can split and animate individually.
 */

import { motion } from 'framer-motion';

interface NeonTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  animate?: boolean;
  glowOnHover?: boolean;
  splitLetters?: boolean;
}

export function NeonText({
  children,
  className = '',
  as: Component = 'span',
  animate = true,
  glowOnHover = true,
  splitLetters = false,
}: NeonTextProps) {
  const letters = children.split('');

  if (splitLetters && animate) {
    return (
      <Component className={`brutal-title ${className}`}>
        <motion.span
          className="inline-flex"
          initial="initial"
          whileHover="hover"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block"
              style={{ 
                whiteSpace: letter === ' ' ? 'pre' : 'normal',
              }}
              variants={{
                initial: { 
                  y: 0,
                  textShadow: '0 0 0 transparent',
                },
                hover: {
                  y: [0, -4, 0],
                  textShadow: [
                    '0 0 0 transparent',
                    '0 0 20px var(--theme-neon), 0 0 40px var(--theme-neon)',
                    '0 0 10px var(--theme-neon)',
                  ],
                  transition: {
                    delay: index * 0.03,
                    duration: 0.3,
                  },
                },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  if (glowOnHover && animate) {
    return (
      <motion.span
        className={`brutal-title ${className}`}
        initial={{ textShadow: '0 0 0 transparent' }}
        whileHover={{
          textShadow: [
            '0 0 0 transparent',
            '0 0 10px var(--theme-neon), 0 0 20px var(--theme-neon), 0 0 40px var(--theme-neon)',
          ],
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <Component className={`brutal-title ${className}`}>
      {children}
    </Component>
  );
}

