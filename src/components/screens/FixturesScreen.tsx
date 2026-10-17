import React, { useState } from 'react';
import { Calendar, Filter, ChevronRight, Play } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';

export const FixturesScreen: React.FC = () => {
  const {
    tenant,
    matches,
    clubs,
    sport,
    setActiveScreen,
    setSelectedMatchId,
    playHapticFeedback,
  } = useLeague();

  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed' | 'postponed'>('all');

  const filteredMatches = matches.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveScreen('match-detail');
    playHapticFeedback();
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-50 text-[#0E0E12] select-none">
      {/* Violet Header */}
      <div
        style={{ backgroundColor: tenant.colors.secondary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-white overflow-hidden"
      >
        <HalftoneOverlay variant="violet" opacity={0.25} />
        <Header variant="violet" title="FIXTURES & RESULTS" />

        {/* Filter Chips */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto mt-4 pb-1 no-scrollbar">
          {(['all', 'live', 'upcoming', 'completed', 'postponed'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatusFilter(filter);
                  playHapticFeedback();
                }}
                className={`font-condensed text-base uppercase px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#C8F135] text-black font-extrabold shadow-xs'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {filter === 'all' ? 'ALL FIXTURES' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches List */}
      <div className="px-4 mt-6 space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200">
            <Calendar className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="font-condensed text-xl uppercase text-neutral-500">
              No matches found for this status.
            </p>
          </div>
        ) : (
          filteredMatches.map((m) => {
            const home = clubs.find((c) => c.id === m.homeClubId);
            const away = clubs.find((c) => c.id === m.awayClubId);

            return (
              <div
                key={m.id}
                onClick={() => handleSelectMatch(m.id)}
                className="btn-press bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow cursor-pointer select-none"
              >
                {/* Header status bar */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    {m.status === 'live' ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C8F135] text-black font-condensed text-xs font-black uppercase">
                        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                        LIVE · {m.currentClock}
                      </span>
                    ) : m.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-condensed text-xs font-bold uppercase">
                        FINAL SCORE
                      </span>
                    ) : m.status === 'postponed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#F0503C]/20 text-[#F0503C] font-condensed text-xs font-bold uppercase">
                        POSTPONED
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase text-neutral-500">
                        {m.scheduledTime}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                    {m.venue}
                  </span>
                </div>

                {/* Clubs & Score */}
                <div className="flex items-center justify-between">
                  {/* Home Club */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-condensed font-black text-sm text-black shrink-0">
                      {home?.code || 'HOM'}
                    </div>
                    <div>
                      <div className="font-condensed text-xl font-bold uppercase leading-none text-[#0E0E12]">
                        {home?.name || 'Home Club'}
                      </div>
                      <div className="text-[11px] text-neutral-500 uppercase mt-0.5">
                        {home?.city}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="px-4 text-center">
                    {m.status === 'upcoming' || m.status === 'postponed' ? (
                      <span className="font-condensed text-2xl font-black text-neutral-400">
                        VS
                      </span>
                    ) : (
                      <div className="font-condensed text-3xl font-black tracking-wider text-[#0E0E12] font-tabular">
                        {m.homeScore} : {m.awayScore}
                      </div>
                    )}
                  </div>

                  {/* Away Club */}
                  <div className="flex items-center justify-end gap-3 flex-1 text-right">
                    <div>
                      <div className="font-condensed text-xl font-bold uppercase leading-none text-[#0E0E12]">
                        {away?.name || 'Away Club'}
                      </div>
                      <div className="text-[11px] text-neutral-500 uppercase mt-0.5">
                        {away?.city}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-condensed font-black text-sm text-black shrink-0">
                      {away?.code || 'AWY'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
