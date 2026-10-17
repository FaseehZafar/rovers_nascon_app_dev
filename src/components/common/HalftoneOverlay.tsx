import React from 'react';

interface HalftoneOverlayProps {
  variant?: 'lime' | 'violet' | 'dark';
  opacity?: number;
  className?: string;
}

export const HalftoneOverlay: React.FC<HalftoneOverlayProps> = ({
  variant = 'lime',
  opacity = 0.65,
  className = '',
}) => {
  const bgClass =
    variant === 'lime'
      ? 'halftone-lime'
      : variant === 'violet'
      ? 'halftone-violet'
      : 'halftone-dark';

  return (
    <div
      aria-hidden="true"
      style={{ opacity }}
      className={`pointer-events-none absolute inset-0 ${bgClass} ${className}`}
    />
  );
};
