import React from 'react';

interface StatTileProps {
  figure: string | number;
  label: string;
  sublabel?: string;
  variant?: 'white' | 'lime' | 'lavender';
  icon?: React.ReactNode;
  chartSnippet?: 'bars' | 'sparkline' | 'gauge';
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  figure,
  label,
  sublabel,
  variant = 'white',
  icon,
  chartSnippet,
  className = '',
}) => {
  const bgClasses = {
    white: 'bg-white text-[#0E0E12]',
    lime: 'bg-[#C8F135] text-[#0E0E12]',
    lavender: 'bg-[#D9D4FA] text-[#0E0E12]',
  }[variant];

  return (
    <div
      className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl md:rounded-3xl min-w-[110px] sm:min-w-[130px] flex-1 shrink-0 ${bgClasses} shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* Top Figure & Icon */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="font-condensed text-2xl sm:text-3xl tracking-tight leading-none font-tabular">
          {figure}
        </span>
        {icon && <div className="text-black/60 shrink-0 mt-0.5">{icon}</div>}
      </div>

      {/* Decorative mini graphic if requested */}
      {chartSnippet === 'bars' && (
        <div className="flex items-end gap-1 h-6 my-1 opacity-70">
          <div className="w-1.5 bg-[#7B6CF2] rounded-t-sm h-[40%]" />
          <div className="w-1.5 bg-[#7B6CF2] rounded-t-sm h-[90%]" />
          <div className="w-1.5 bg-[#7B6CF2] rounded-t-sm h-[65%]" />
          <div className="w-1.5 bg-[#7B6CF2] rounded-t-sm h-[100%]" />
          <div className="w-1.5 bg-[#7B6CF2]/40 rounded-t-sm h-[50%]" />
        </div>
      )}

      {chartSnippet === 'gauge' && (
        <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden my-1">
          <div className="bg-[#0E0E12] h-full w-[78%] rounded-full" />
        </div>
      )}

      {/* Bottom Labels */}
      <div>
        <div className="font-condensed text-sm sm:text-base leading-none uppercase tracking-wide font-extrabold text-[#0E0E12]">
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-tight mt-0.5">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
