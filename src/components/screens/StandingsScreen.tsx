import React from 'react';
import { ArrowUp, ArrowDown, Minus, CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';

export const StandingsScreen: React.FC = () => {
  const {
    tenant,
    standings,
    clubs,
    sport,
    setActiveScreen,
    setSelectedClubId,
    playHapticFeedback,
  } = useLeague();

  const handleSelectClub = (clubId: string) => {
    setSelectedClubId(clubId);
    setActiveScreen('club-profile');
    playHapticFeedback();
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-50 text-[#0E0E12] select-none">
      {/* Lime Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="LEAGUE STANDINGS" />

        <div className="relative z-10 mt-3 px-1">
          <div className="font-condensed text-5xl font-black uppercase leading-none">
            {sport.name} TABLE
          </div>
          <div className="text-xs uppercase font-bold text-black/70 mt-1">
            QUALIFICATION & RELEGATION STAGE 2026
          </div>
        </div>
      </div>

      {/* Standings Table Container */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 pb-2 border-b border-neutral-100 text-[11px] font-black uppercase tracking-wider text-neutral-400">
            <span className="col-span-1 text-center">POS</span>
            <span className="col-span-5">CLUB</span>
            <span className="col-span-1 text-center">P</span>
            <span className="col-span-1 text-center">W</span>
            <span className="col-span-1 text-center">D</span>
            <span className="col-span-1 text-center">L</span>
            <span className="col-span-2 text-right">PTS</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-100 mt-1">
            {standings.map((row) => {
              const club = clubs.find((c) => c.id === row.clubId);
              if (!club) return null;

              // Rank movement icon
              const isUp = row.previousRank > row.rank;
              const isDown = row.previousRank < row.rank;

              return (
                <div
                  key={row.clubId}
                  onClick={() => handleSelectClub(club.id)}
                  className="btn-press grid grid-cols-12 gap-2 items-center py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  {/* Position & Movement */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="font-condensed text-xl font-bold font-tabular text-[#0E0E12]">
                      {row.rank}
                    </span>
                    <div className="text-[9px]">
                      {isUp ? (
                        <ArrowUp className="w-2.5 h-2.5 text-emerald-600" />
                      ) : isDown ? (
                        <ArrowDown className="w-2.5 h-2.5 text-rose-600" />
                      ) : (
                        <Minus className="w-2.5 h-2.5 text-neutral-300" />
                      )}
                    </div>
                  </div>

                  {/* Club Details & Qualification Badge */}
                  <div className="col-span-5 flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-[#C8F135] font-condensed font-black text-xs flex items-center justify-center shrink-0">
                      {club.code}
                    </div>
                    <div className="truncate">
                      <div className="font-condensed text-base sm:text-lg font-bold uppercase leading-none text-[#0E0E12] truncate">
                        {club.name}
                      </div>

                      {/* Qualification Tag */}
                      <div className="flex items-center gap-1 mt-0.5">
                        {row.qualification === 'clinched' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#C8F135] text-black text-[9px] font-black uppercase">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            CLINCHED #1
                          </span>
                        ) : row.qualification === 'eliminated' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-rose-100 text-rose-700 text-[9px] font-black uppercase">
                            <XCircle className="w-2.5 h-2.5" />
                            ELIMINATED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-neutral-100 text-neutral-600 text-[9px] font-semibold uppercase">
                            <AlertCircle className="w-2.5 h-2.5" />
                            STILL POSSIBLE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats columns */}
                  <span className="col-span-1 text-center font-tabular text-xs font-semibold text-neutral-600">
                    {row.played}
                  </span>
                  <span className="col-span-1 text-center font-tabular text-xs font-semibold text-neutral-600">
                    {row.won}
                  </span>
                  <span className="col-span-1 text-center font-tabular text-xs font-semibold text-neutral-600">
                    {row.drawn}
                  </span>
                  <span className="col-span-1 text-center font-tabular text-xs font-semibold text-neutral-600">
                    {row.lost}
                  </span>

                  {/* Points */}
                  <span className="col-span-2 text-right font-condensed text-2xl font-black font-tabular text-[#0E0E12]">
                    {row.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8F135]" />
            <span>Playoff Championship Berth</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0503C]" />
            <span>Relegation Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
