import React from 'react';
import { useLeague } from '../../context/LeagueContext';

interface BigActionButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'lime' | 'violet' | 'white' | 'dark' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const BigActionButton: React.FC<BigActionButtonProps> = ({
  label,
  onClick,
  variant = 'lime',
  icon,
  disabled = false,
  className = '',
}) => {
  const { tenant, playHapticFeedback } = useLeague();

  const handleClick = () => {
    if (disabled) return;
    playHapticFeedback();
    if (onClick) onClick();
  };

  const getBgStyle = () => {
    if (variant === 'lime') return { backgroundColor: tenant.colors.primary, color: '#0E0E12' };
    if (variant === 'violet') return { backgroundColor: tenant.colors.secondary, color: '#FFFFFF' };
    if (variant === 'white') return { backgroundColor: '#FFFFFF', color: '#0E0E12' };
    if (variant === 'dark') return { backgroundColor: '#0E0E12', color: '#FFFFFF' };
    if (variant === 'danger') return { backgroundColor: tenant.colors.danger, color: '#FFFFFF' };
    return { backgroundColor: tenant.colors.primary, color: '#0E0E12' };
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      style={getBgStyle()}
      className={`btn-press group relative flex w-full items-center justify-center gap-3 py-4 px-6 rounded-2xl md:rounded-[22px] font-condensed text-2xl md:text-3xl tracking-wide uppercase transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      <span className="relative z-10 transition-transform duration-150 group-active:scale-98">
        {label}
      </span>
      {icon && <span className="relative z-10 transition-transform duration-150 group-hover:translate-x-1">{icon}</span>}
    </button>
  );
};
