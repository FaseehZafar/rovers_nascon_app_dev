import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowRight, Play, Shield, Users, Box, Sparkles } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';

export const HomeScreen: React.FC = () => {
  const {
    tenant,
    sport,
    role,
    matches,
    clubs,
    players,
    setActiveScreen,
    setSelectedMatchId,
    setSelectedPlayerId,
    setSelectedClubId,
    playHapticFeedback,
  } = useLeague();

  const [localSearch, setLocalSearch] = useState('');

  // Find next or live match
  const liveMatch = matches.find((m) => m.status === 'live');
  const nextMatch = liveMatch || matches.find((m) => m.status === 'upcoming') || matches[0];

  const homeClub = clubs.find((c) => c.id === nextMatch?.homeClubId) || clubs[0];
  const awayClub = clubs.find((c) => c.id === nextMatch?.awayClubId) || clubs[1];

  // Best players / leaders
  const topPlayers = players.slice(0, 3);

  // Performance bars mock (tall vertical bars with a playhead)
  const barHeights = [45, 60, 30, 85, 95, 75, 40, 88, 65, 50, 78, 92, 35, 68, 80, 58, 84, 90, 62, 70];
  const activePlayheadIndex = 8;

  const handleOpenMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveScreen('match-detail');
    playHapticFeedback();
  };

  const handleOpenPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setActiveScreen('match-detail'); // or player modal
    playHapticFeedback();
  };

  const handleOpenClub = (clubId: string) => {
    setSelectedClubId(clubId);
    setActiveScreen('club-profile');
    playHapticFeedback();
  };

  // Headline words
  const headlineLine1 = sport.displayName.split(' ')[0] || 'LIGUE';
  const headlineLine2 = sport.displayName.split(' ')[1] || sport.name.toUpperCase();

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden bg-white text-[#0E0E12]">
      {/* 1. HERO LIME HEADER (Exact Reference Screen 1) */}
      <section
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 overflow-hidden rounded-b-[36px] shadow-sm select-none"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />

        {/* Top Header bar with round crest & menu */}
        <Header variant="lime" />

        {/* Giant Two-Line Headline */}
        <div className="relative z-10 mt-3 px-1">
          <h1 className="font-condensed text-6xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.88] tracking-tight text-black">
            {headlineLine1}
          </h1>
          <h2
            style={{ color: tenant.colors.toneOnTone }}
            className="font-condensed text-6xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.88] tracking-tight mt-1"
          >
            {headlineLine2}
          </h2>
        </div>

        {/* 2. VIOLET MATCH PANEL (Exact Reference Screen 1) */}
        {nextMatch && (
          <div
            style={{ backgroundColor: tenant.colors.secondary }}
            className="relative z-10 mt-6 rounded-[28px] p-4 text-white shadow-lg overflow-hidden"
          >
            <HalftoneOverlay variant="violet" opacity={0.2} />

            {/* Top row: Round Crest, Kickoff date, and Lime Bet/Match Centre Link */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Round Crest */}
                <button
                  type="button"
                  onClick={() => handleOpenClub(homeClub.id)}
                  className="w-12 h-12 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-[#0E0E12] text-[#C8F135] font-condensed font-black flex items-center justify-center text-sm">
                    {homeClub.code}
                  </div>
                </button>

                {/* Match Time or Live Score */}
                <div>
                  {nextMatch.status === 'live' ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F135] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8F135]"></span>
                      </span>
                      <span className="font-condensed text-2xl font-bold tracking-wide font-tabular">
                        LIVE {nextMatch.homeScore} : {nextMatch.awayScore}
                      </span>
                    </div>
                  ) : (
                    <div className="font-condensed text-2xl font-bold tracking-wide leading-none uppercase">
                      {nextMatch.scheduledTime}
                    </div>
                  )}
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/80 mt-0.5">
                    {homeClub.shortName} vs {awayClub.shortName}
                  </div>
                </div>
              </div>

              {/* Action Link: Lime Text with Arrow */}
              <button
                type="button"
                onClick={() => handleOpenMatch(nextMatch.id)}
                style={{ color: tenant.colors.primary }}
                className="btn-press flex items-center gap-1 font-condensed text-2xl font-bold uppercase tracking-wide cursor-pointer hover:opacity-90"
              >
                <span>{nextMatch.status === 'live' ? 'MATCH' : 'BET'}</span>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Underline Search Input */}
            <div className="relative z-10 mt-5 pt-1 border-b border-white/30 flex items-center gap-2 pb-1.5">
              <Search className="w-4 h-4 text-white/70" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="SEARCH CLUBS OR PLAYERS"
                className="w-full bg-transparent text-white placeholder-white/60 font-condensed text-base tracking-wider uppercase focus:outline-none"
              />
            </div>

            {/* Team Performance Tabs */}
            <div className="relative z-10 flex items-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-wider text-white/70">
              <span className="text-white border-b-2 border-[#C8F135] pb-0.5">
                TEAM PERFOMANCE
              </span>
              <span>SUCCESS ATACKS</span>
              <span>FAILES</span>
            </div>

            {/* Vertical Bar Chart with Playhead (Reference Screen 1) */}
            <div className="relative z-10 mt-3 h-16 w-full flex items-end gap-1 px-1 bg-black/10 rounded-xl py-2 overflow-hidden">
              {barHeights.map((h, idx) => {
                const isPlayhead = idx === activePlayheadIndex;
                const isFailed = idx === 19;
                return (
                  <div key={idx} className="relative flex-1 h-full flex items-end">
                    {/* Vertical bar */}
                    <div
                      style={{
                        height: `${h}%`,
                        backgroundColor: isFailed ? '#F0503C' : 'rgba(255,255,255,0.45)',
                      }}
                      className="w-full rounded-t-xs transition-all duration-300"
                    />
                    {/* Playhead line */}
                    {isPlayhead && (
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                        <div className="w-0.5 flex-1 bg-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. STAFF QUICK ACTION TILES (Staff roles get special chunky action tiles) */}
      {['super-admin', 'organizer', 'manager'].includes(role) && (
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-condensed text-sm font-extrabold uppercase tracking-wider text-neutral-400">
              STAFF COMMAND TILES
            </span>
            <span className="text-[10px] uppercase font-bold text-neutral-400">
              ROLE: {role.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {role === 'organizer' && (
              <button
                type="button"
                onClick={() => setActiveScreen('scoring')}
                className="btn-press p-3 rounded-2xl bg-[#C8F135] text-[#0E0E12] text-left shadow-xs cursor-pointer"
              >
                <Play className="w-5 h-5 mb-1.5 text-black" />
                <div className="font-condensed text-lg font-bold leading-tight uppercase">
                  SCORE MATCH
                </div>
                <div className="text-[10px] text-black/70 font-semibold uppercase">Live Entry</div>
              </button>
            )}

            {role === 'manager' && (
              <button
                type="button"
                onClick={() => setActiveScreen('roster')}
                className="btn-press p-3 rounded-2xl bg-[#C8F135] text-[#0E0E12] text-left shadow-xs cursor-pointer"
              >
                <Users className="w-5 h-5 mb-1.5 text-black" />
                <div className="font-condensed text-lg font-bold leading-tight uppercase">
                  ROSTER
                </div>
                <div className="text-[10px] text-black/70 font-semibold uppercase">Squad Manager</div>
              </button>
            )}

            {role === 'super-admin' && (
              <button
                type="button"
                onClick={() => setActiveScreen('admin')}
                className="btn-press p-3 rounded-2xl bg-[#C8F135] text-[#0E0E12] text-left shadow-xs cursor-pointer"
              >
                <Shield className="w-5 h-5 mb-1.5 text-black" />
                <div className="font-condensed text-lg font-bold leading-tight uppercase">
                  ADMIN JSON
                </div>
                <div className="text-[10px] text-black/70 font-semibold uppercase">Sport Engine</div>
              </button>
            )}

            {/* 3D Stadium Shortcut */}
            <button
              type="button"
              onClick={() => setActiveScreen('stadium3d')}
              className="btn-press p-3 rounded-2xl bg-[#7B6CF2] text-white text-left shadow-xs cursor-pointer"
            >
              <Box className="w-5 h-5 mb-1.5 text-white" />
              <div className="font-condensed text-lg font-bold leading-tight uppercase">
                3D ARENA
              </div>
              <div className="text-[10px] text-white/80 font-semibold uppercase">Three.js Field</div>
            </button>

            {/* AI Media Lab Shortcut */}
            <button
              type="button"
              onClick={() => setActiveScreen('medialab')}
              className="btn-press p-3 rounded-2xl bg-[#D9D4FA] text-[#0E0E12] text-left shadow-xs cursor-pointer"
            >
              <Sparkles className="w-5 h-5 mb-1.5 text-[#7B6CF2]" />
              <div className="font-condensed text-lg font-bold leading-tight uppercase">
                MEDIA LAB
              </div>
              <div className="text-[10px] text-black/60 font-semibold uppercase">AI Studio</div>
            </button>
          </div>
        </section>
      )}

      {/* 4. BEST PLAYERS / LEADERS (Exact Reference Screen 1 Bottom) */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-condensed text-2xl font-bold uppercase tracking-tight text-[#0E0E12]">
            BEST PLAYERS
          </h3>
          <button
            type="button"
            onClick={() => setActiveScreen('fixtures')}
            className="flex items-center gap-1 font-condensed text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-black cursor-pointer"
          >
            <span>MORE PLAYERS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Players List with round avatars and big condensed numbers */}
        <div className="flex flex-col gap-2.5">
          {topPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => handleOpenPlayer(player.id)}
              className="btn-press flex items-center justify-between p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer select-none"
            >
              {/* Left: Avatar with colored ring & Player Name */}
              <div className="flex items-center gap-3">
                <div
                  style={{ borderColor: player.avatarRingColor }}
                  className="w-12 h-12 rounded-full border-2 bg-neutral-900 text-white flex items-center justify-center font-condensed text-lg font-black shadow-xs shrink-0"
                >
                  {player.avatarInitials}
                </div>
                <div>
                  <div className="font-condensed text-xl font-bold uppercase leading-none text-[#0E0E12]">
                    {player.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium mt-0.5">
                    {player.position}
                  </div>
                </div>
              </div>

              {/* Center Halftone dots texture decorative */}
              <div className="hidden sm:flex items-center gap-1 opacity-25">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
              </div>

              {/* Right: Big Condensed Figure */}
              <div className="text-right">
                <div className="font-condensed text-3xl font-black font-tabular leading-none text-[#0E0E12]">
                  {player.stats.primaryMetric}
                  <span className="text-lg text-neutral-400 font-medium">
                    /{player.stats.secondaryMetric}%
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                  EFFICIENCY
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STANDINGS PREVIEW ROW (Peek at bottom to invite scrolling) */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-condensed text-2xl font-bold uppercase tracking-tight text-[#0E0E12]">
            LEAGUE STANDINGS
          </h3>
          <button
            type="button"
            onClick={() => setActiveScreen('standings')}
            className="flex items-center gap-1 font-condensed text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-black cursor-pointer"
          >
            <span>TABLE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 rounded-3xl bg-[#7B6CF2] text-white shadow-md relative overflow-hidden">
          <HalftoneOverlay variant="violet" opacity={0.2} />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-black font-condensed text-xl font-black flex items-center justify-center">
                1
              </div>
              <div>
                <div className="font-condensed text-2xl font-bold uppercase leading-none">
                  {clubs[0]?.name || 'SILVER RAIDERS'}
                </div>
                <div className="text-xs text-white/80 font-medium mt-0.5">
                  11 WINS · CLINCHED #1 SEED
                </div>
              </div>
            </div>
            <div className="font-condensed text-4xl font-black text-[#C8F135] font-tabular">
              35 PTS
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
