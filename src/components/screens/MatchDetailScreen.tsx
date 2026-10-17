import React, { useState } from 'react';
import { X, Play, ShoppingBag, ArrowRight, Activity, Clock, Shield } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { RoundButton } from '../common/RoundButton';
import { StatTile } from '../common/StatTile';
import { BigActionButton } from '../common/BigActionButton';

export const MatchDetailScreen: React.FC = () => {
  const {
    tenant,
    role,
    matches,
    clubs,
    players,
    products,
    selectedMatchId,
    selectedPlayerId,
    setActiveScreen,
    addToCart,
    playHapticFeedback,
  } = useLeague();

  const [activeTab, setActiveTab] = useState<'player' | 'timeline' | 'pinned-merch'>('player');

  const match = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const homeClub = clubs.find((c) => c.id === match?.homeClubId) || clubs[0];
  const awayClub = clubs.find((c) => c.id === match?.awayClubId) || clubs[1];

  // Selected player for hero view (defaults to Hunter Renfrow as in reference screen 3)
  const heroPlayer =
    players.find((p) => p.id === selectedPlayerId) ||
    players.find((p) => p.name.includes('HUNTER RENFROW')) ||
    players[0];

  const pinnedProduct = products.find((p) => p.id === match.pinnedProductId) || products[0];

  const handleQuickAddMerch = () => {
    addToCart(pinnedProduct, pinnedProduct.variants.sizes[0], pinnedProduct.variants.colors[0], 1);
    setActiveScreen('store');
    playHapticFeedback();
  };

  return (
    <div
      style={{ backgroundColor: tenant.colors.secondary }}
      className="relative min-h-screen pb-24 overflow-x-hidden text-white select-none"
    >
      <HalftoneOverlay variant="violet" opacity={0.25} />

      {/* Top Bar: Round Close Button & Title */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <RoundButton
          size="md"
          variant="translucent"
          onClick={() => setActiveScreen('fixtures')}
          ariaLabel="Close"
        >
          <X className="w-5 h-5 text-white stroke-[2.5]" />
        </RoundButton>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs font-condensed text-sm font-bold uppercase tracking-wider">
          {match.status === 'live' && (
            <span className="w-2 h-2 rounded-full bg-[#C8F135] animate-pulse" />
          )}
          <span>{match.status === 'live' ? `LIVE ${match.currentClock}` : match.scheduledTime}</span>
        </div>

        <RoundButton
          size="md"
          variant="translucent"
          onClick={() => setActiveScreen('store')}
          ariaLabel="Store"
        >
          <ShoppingBag className="w-5 h-5 text-white stroke-[2]" />
        </RoundButton>
      </div>

      {/* Giant Ghosted Number Behind Content (Reference Screen 3: "89") */}
      <div className="absolute top-8 right-2 font-condensed text-[200px] sm:text-[260px] font-black text-white/10 pointer-events-none select-none z-0 leading-none">
        {heroPlayer.number}
      </div>

      {/* Hero Header & Player Name (Exact Reference Screen 3) */}
      <div className="relative z-10 px-4 mt-1">
        {/* Live Match Score Strip */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/25 backdrop-blur-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-black font-condensed text-xs font-black flex items-center justify-center">
              {homeClub.code}
            </div>
            <span className="font-condensed text-xl font-bold uppercase">{homeClub.shortName}</span>
          </div>

          <div className="font-condensed text-4xl font-black tracking-wider text-[#C8F135] font-tabular">
            {match.homeScore} : {match.awayScore}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-condensed text-xl font-bold uppercase">{awayClub.shortName}</span>
            <div className="w-8 h-8 rounded-full bg-white text-black font-condensed text-xs font-black flex items-center justify-center">
              {awayClub.code}
            </div>
          </div>
        </div>

        {/* Player Giant Condensed Title */}
        <div className="mt-2">
          <h1 className="font-condensed text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-sm">
            {heroPlayer.name.split(' ')[0]}
          </h1>
          <h2 className="font-condensed text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-sm mt-0.5">
            {heroPlayer.name.split(' ')[1] || ''}
          </h2>
        </div>

        {/* Player Silhouette / Role */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#C8F135] text-black font-condensed text-sm font-extrabold uppercase">
            #{heroPlayer.number}
          </span>
          <span className="text-xs uppercase font-bold text-white/80 tracking-wider">
            {heroPlayer.position} · {homeClub.name}
          </span>
        </div>
      </div>

      {/* Stat Tiles & Tabs */}
      <div className="relative z-10 px-4 mt-6">
        {/* Tab switchers */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('player')}
            className={`font-condensed text-base uppercase px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${
              activeTab === 'player'
                ? 'bg-[#C8F135] text-black font-bold'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            PERFORMANCE STATS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`font-condensed text-base uppercase px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${
              activeTab === 'timeline'
                ? 'bg-[#C8F135] text-black font-bold'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            MATCH TIMELINE ({match.events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pinned-merch')}
            className={`font-condensed text-base uppercase px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${
              activeTab === 'pinned-merch'
                ? 'bg-[#C8F135] text-black font-bold'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            MATCH MERCH
          </button>
        </div>

        {/* Horizontal Row of Rounded Stat Tiles (Exact Reference Screen 3) */}
        {activeTab === 'player' && (
          <div className="space-y-4">
            <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              <StatTile
                figure={heroPlayer.stats.speed}
                label="SPEED"
                sublabel="100M RUN"
                variant="white"
                chartSnippet="bars"
              />
              <StatTile
                figure={heroPlayer.stats.power}
                label="POWER"
                sublabel="BENCH PRESS"
                variant="lime"
                chartSnippet="gauge"
              />
              <StatTile
                figure={heroPlayer.stats.stamina}
                label="STAMINA"
                sublabel="MATCH FIT"
                variant="lavender"
              />
            </div>

            {/* Additional Player Metric Card */}
            <div className="p-4 rounded-3xl bg-white text-[#0E0E12] shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-condensed text-xl font-bold uppercase text-[#0E0E12]">
                  CAREER EFFICIENCY
                </span>
                <span className="font-condensed text-3xl font-black text-[#7B6CF2]">
                  {heroPlayer.stats.rating} OVR
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Specialized slot receiver capable of explosive short-yard separation and crisp
                lateral agility. Has recorded {heroPlayer.stats.primaryMetric} major offensive plays this season.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Match Event Timeline */}
        {activeTab === 'timeline' && (
          <div className="p-4 rounded-3xl bg-white text-[#0E0E12] shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-condensed text-xl font-bold uppercase">
                SCORING & EVENT LOG
              </span>
              <Clock className="w-4 h-4 text-neutral-500" />
            </div>

            {match.events.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No match events recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {match.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-condensed text-base font-black px-2 py-0.5 rounded-md bg-black text-[#C8F135]">
                        {evt.minute}&apos;
                      </span>
                      <div>
                        <div className="font-condensed text-base font-bold uppercase leading-none text-[#0E0E12]">
                          {evt.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium">
                          {evt.playerName || 'Club Event'}
                        </div>
                      </div>
                    </div>
                    <div className="font-condensed text-xl font-bold text-[#7B6CF2]">
                      {evt.points > 0 ? `+${evt.points}` : 'CARD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pinned Match Merch Item */}
        {activeTab === 'pinned-merch' && pinnedProduct && (
          <div className="p-4 rounded-3xl bg-white text-[#0E0E12] shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md bg-[#C8F135] text-black text-[10px] font-black uppercase">
                {pinnedProduct.badge || 'OFFICIAL MATCH GEAR'}
              </span>
              <span className="font-condensed text-2xl font-black text-[#0E0E12]">
                ${pinnedProduct.price.toFixed(2)}
              </span>
            </div>
            <h4 className="font-condensed text-2xl font-bold uppercase mb-1">
              {pinnedProduct.title}
            </h4>
            <p className="text-xs text-neutral-600 mb-3">{pinnedProduct.description}</p>
            <BigActionButton
              label="ADD TO CART & CHECKOUT"
              variant="lime"
              onClick={handleQuickAddMerch}
            />
          </div>
        )}

        {/* Bottom Giant Action Button (Exact Reference Screen 3: "READ MORE" or "SCORE MATCH") */}
        <div className="mt-6">
          {role === 'organizer' ? (
            <BigActionButton
              label="SCORE THIS MATCH"
              variant="lime"
              onClick={() => setActiveScreen('scoring')}
            />
          ) : (
            <BigActionButton
              label="READ FULL SCOUT REPORT"
              variant="lime"
              onClick={() => setActiveScreen('stadium3d')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
