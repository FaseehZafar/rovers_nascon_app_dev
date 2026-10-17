import React, { useState } from 'react';
import { ArrowLeft, Users, MoreHorizontal, Shield, MapPin, Award, Phone } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { ComparisonBar } from '../common/ComparisonBar';
import { RoundButton } from '../common/RoundButton';
import { BigActionButton } from '../common/BigActionButton';

export const ClubProfileScreen: React.FC = () => {
  const {
    tenant,
    role,
    clubs,
    players,
    selectedClubId,
    setActiveScreen,
    setSelectedPlayerId,
    playHapticFeedback,
  } = useLeague();

  const [activeTab, setActiveTab] = useState<'cohesion' | 'roster' | 'venue'>('cohesion');

  const club = clubs.find((c) => c.id === selectedClubId) || clubs[0];
  const squad = players.filter((p) => p.clubId === club.id);

  // Group players by position
  const keyAvatars = squad.slice(0, 5);

  const handlePlayerTap = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setActiveScreen('match-detail');
    playHapticFeedback();
  };

  return (
    <div
      style={{ backgroundColor: tenant.colors.secondary }}
      className="relative min-h-screen pb-24 overflow-x-hidden text-white select-none"
    >
      <HalftoneOverlay variant="violet" opacity={0.25} />

      {/* Top Navigation Row: Back Button */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <RoundButton
          size="md"
          variant="white"
          onClick={() => setActiveScreen('home')}
          ariaLabel="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 text-black stroke-[2.5]" />
        </RoundButton>

        <span className="font-condensed text-lg uppercase tracking-wider text-white/80 font-bold">
          CLUB PROFILE
        </span>

        <RoundButton
          size="md"
          variant="translucent"
          onClick={() => {}}
          ariaLabel="Options"
        >
          <MoreHorizontal className="w-5 h-5 text-white stroke-[2.5]" />
        </RoundButton>
      </div>

      {/* Giant Ghosted Background Monogram */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-condensed text-[180px] font-black text-white/5 pointer-events-none select-none z-0">
        {club.code}
      </div>

      {/* Center Hero: Big Round Crest in White Circle + Giant Title (Reference Screen 2) */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-1">
        {/* Big Round Crest */}
        <div className="w-24 h-24 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center mb-3">
          <div
            style={{ backgroundColor: club.primaryColor }}
            className="w-full h-full rounded-full flex flex-col items-center justify-center text-[#C8F135] font-condensed font-black shadow-inner"
          >
            <Shield className="w-8 h-8 text-[#C8F135] mb-0.5" />
            <span className="text-xs leading-none tracking-widest">{club.code}</span>
          </div>
        </div>

        {/* Giant White-and-Black Condensed Title (Reference Screen 2) */}
        <h1 className="font-condensed text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-sm">
          TEAM
        </h1>
        <h2 className="font-condensed text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.88] tracking-tight text-[#0E0E12] mt-0.5">
          MEMBERS
        </h2>

        {/* Lime Subline with Icon (Reference Screen 2: "53 PLAYERS") */}
        <div
          style={{ color: tenant.colors.primary }}
          className="flex items-center gap-1.5 font-condensed text-xl sm:text-2xl font-black uppercase tracking-wider mt-2"
        >
          <Users className="w-5 h-5" />
          <span>{squad.length > 0 ? squad.length * 5 : 53} PLAYERS</span>
        </div>
      </div>

      {/* White Overlapping Rounded Card (Reference Screen 2) */}
      <div className="relative z-20 mt-6 bg-white text-[#0E0E12] rounded-t-[36px] shadow-2xl p-5 sm:p-6 min-h-[500px]">
        {/* Navigation chips inside card */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('cohesion')}
              className={`font-condensed text-base uppercase px-3 py-1 rounded-full cursor-pointer transition-colors ${
                activeTab === 'cohesion'
                  ? 'bg-[#0E0E12] text-white font-bold'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              DEFENSE COHESION
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`font-condensed text-base uppercase px-3 py-1 rounded-full cursor-pointer transition-colors ${
                activeTab === 'roster'
                  ? 'bg-[#0E0E12] text-white font-bold'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              ACTIVE SQUAD ({squad.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('venue')}
              className={`font-condensed text-base uppercase px-3 py-1 rounded-full cursor-pointer transition-colors ${
                activeTab === 'venue'
                  ? 'bg-[#0E0E12] text-white font-bold'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              STADIUM
            </button>
          </div>

          <RoundButton size="sm" variant="translucent">
            <MoreHorizontal className="w-4 h-4 text-neutral-600" />
          </RoundButton>
        </div>

        {/* Tab 1: Cohesion & Paired Comparison Bars (Exact Reference Screen 2) */}
        {activeTab === 'cohesion' && (
          <div>
            {/* Numbered Round Avatars with Coloured Rings (Reference Screen 2) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-3">
              {keyAvatars.map((player, idx) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handlePlayerTap(player.id)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    style={{ borderColor: player.avatarRingColor }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 bg-[#0E0E12] text-white flex items-center justify-center font-condensed text-base sm:text-lg font-bold shadow-md transition-transform group-hover:scale-105"
                  >
                    {player.avatarInitials}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black font-tabular flex items-center justify-center -mt-2 shadow-xs">
                    {idx + 1}
                  </div>
                </button>
              ))}
            </div>

            {/* Paired Comparison Bars (Reference Screen 2) */}
            <div className="mt-6 space-y-4">
              <ComparisonBar
                label="PROTECTIVE LINE"
                leftValue={club.defenseCohesion}
                rightValue={78}
              />
              <ComparisonBar
                label="TEAMWORK"
                leftValue={club.teamworkScore}
                rightValue={39}
              />
              <ComparisonBar
                label="SPEED OF ATTACK REPULSION"
                leftValue={club.repulsionSpeed}
                rightValue={39}
              />
            </div>

            {/* Action Bar */}
            <div className="mt-8">
              {role === 'manager' ? (
                <BigActionButton
                  label="MANAGE SQUAD ROSTER"
                  variant="lime"
                  onClick={() => setActiveScreen('roster')}
                />
              ) : (
                <BigActionButton
                  label="EXPLORE 3D TACTIC ARENA"
                  variant="lime"
                  onClick={() => setActiveScreen('stadium3d')}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-2.5">
            {squad.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerTap(player.id)}
                className="btn-press flex items-center justify-between p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ borderColor: player.avatarRingColor }}
                    className="w-11 h-11 rounded-full border-2 bg-[#0E0E12] text-white flex items-center justify-center font-condensed text-base font-bold shrink-0"
                  >
                    #{player.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-condensed text-xl font-bold uppercase text-[#0E0E12]">
                        {player.name}
                      </span>
                      {player.isCaptain && (
                        <span className="px-1.5 py-0.5 rounded-sm bg-[#C8F135] text-black text-[9px] font-black uppercase">
                          CAPTAIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 font-medium">
                      {player.position} · {player.roleDescription}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-condensed text-2xl font-bold font-tabular text-[#0E0E12]">
                    {player.stats.rating}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">RATING</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Venue & Stadium */}
        {activeTab === 'venue' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-[#7B6CF2]" />
                <h4 className="font-condensed text-2xl font-bold uppercase text-[#0E0E12]">
                  {club.venueName}
                </h4>
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                {club.city} · Capacity: {club.venueCapacity.toLocaleString()} Spectators
              </p>
              <div className="mt-3 p-3 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-neutral-400">COORDINATES</div>
                  <div className="font-mono text-xs font-semibold text-neutral-800">
                    {club.venueCoords.lat}° N, {club.venueCoords.lng}° W
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScreen('stadium3d')}
                  className="px-3 py-1.5 rounded-lg bg-[#C8F135] text-black font-condensed text-sm font-bold uppercase cursor-pointer"
                >
                  3D PITCH TOUR
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase">HEAD COACH</div>
                <div className="font-condensed text-xl font-bold text-[#0E0E12]">
                  {club.managerName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-neutral-400 uppercase">FAN BASE</div>
                <div className="font-condensed text-xl font-bold text-[#7B6CF2]">
                  {club.fanCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
