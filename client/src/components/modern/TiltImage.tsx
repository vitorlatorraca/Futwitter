/**
 * TiltImage Component
 * 
 * Image with 3D tilt/parallax effect on hover.
 * Reveals neon border and scales slightly.
 */

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  tiltStrength?: number;
  scaleOnHover?: number;
  showBorder?: boolean;
}

export function TiltImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  tiltStrength = 10,
  scaleOnHover = 1.02,
  showBorder = true,
}: TiltImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = ((e.clientY - centerY) / (rect.height / 2)) * tiltStrength;
    const y = ((centerX - e.clientX) / (rect.width / 2)) * tiltStrength;
    
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${containerClassName}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: '1000px' }}
    >
      {/* Neon border glow */}
      {showBorder && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered 
              ? 'inset 0 0 0 3px var(--theme-neon), 0 0 20px var(--theme-neon)' 
              : 'inset 0 0 0 0 transparent',
          }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Image with tilt */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? scaleOnHover : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
        }}
        animate={{
          x: isHovered ? '100%' : '-100%',
        }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}

