import React from 'react';

interface RoundButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'translucent' | 'white' | 'lime' | 'violet' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const RoundButton: React.FC<RoundButtonProps> = ({
  onClick,
  children,
  variant = 'translucent',
  size = 'md',
  className = '',
  ariaLabel,
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
  }[size];

  const variantClasses = {
    translucent: 'bg-black/15 hover:bg-black/25 active:bg-black/35 text-black backdrop-blur-xs',
    white: 'bg-white hover:bg-neutral-100 text-black shadow-sm',
    lime: 'bg-[#C8F135] hover:bg-[#b8e228] text-black shadow-sm',
    violet: 'bg-[#7B6CF2] hover:bg-[#6a5ad8] text-white shadow-sm',
    dark: 'bg-[#0E0E12] hover:bg-black text-white',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`btn-press inline-flex items-center justify-center rounded-full shrink-0 cursor-pointer select-none transition-transform duration-150 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};
