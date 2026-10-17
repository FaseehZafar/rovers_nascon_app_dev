import React from 'react';
import { useLeague } from '../../context/LeagueContext';

interface ComparisonBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  max?: number;
  className?: string;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  label,
  leftValue,
  rightValue,
  max = 100,
  className = '',
}) => {
  const { tenant } = useLeague();
  const leftPct = Math.min(100, Math.max(10, (leftValue / max) * 100));
  const rightPct = Math.min(100, Math.max(10, (rightValue / max) * 100));

  return (
    <div className={`w-full my-2.5 ${className}`}>
      {/* Numbers & Center Title */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
        <span className="font-condensed text-lg sm:text-xl font-bold font-tabular text-[#0E0E12]">
          {leftValue}
        </span>
        <span className="font-condensed text-xs sm:text-sm tracking-wider uppercase text-neutral-600 font-extrabold text-center px-2">
          {label}
        </span>
        <span className="font-condensed text-lg sm:text-xl font-bold font-tabular text-neutral-800">
          {rightValue}
        </span>
      </div>

      {/* Paired visual bars */}
      <div className="flex items-center gap-1.5 h-2 w-full">
        {/* Left bar (Primary Lime) */}
        <div className="flex-1 flex justify-end bg-neutral-200/70 rounded-full overflow-hidden h-full">
          <div
            style={{
              width: `${leftPct}%`,
              backgroundColor: tenant.colors.primary,
            }}
            className="h-full rounded-full transition-all duration-500"
          />
        </div>

        {/* Center notch */}
        <div className="w-1 h-2.5 bg-neutral-300 rounded-xs shrink-0" />

        {/* Right bar (Red-Orange) */}
        <div className="flex-1 flex justify-start bg-neutral-200/70 rounded-full overflow-hidden h-full">
          <div
            style={{
              width: `${rightPct}%`,
              backgroundColor: tenant.colors.danger,
            }}
            className="h-full rounded-full transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
};
