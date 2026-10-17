import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Shield, Clock, Undo2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { RoundButton } from '../common/RoundButton';
import { BigActionButton } from '../common/BigActionButton';

export const ScoringScreen: React.FC = () => {
  const {
    tenant,
    sport,
    matches,
    clubs,
    players,
    recordScoringEvent,
    undoLastMatchEvent,
    playHapticFeedback,
    isOnline,
  } = useLeague();

  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(4120); // ~68 minutes
  const [showUndoConfirm, setShowUndoConfirm] = useState<boolean>(false);

  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const homeClub = clubs.find((c) => c.id === activeMatch?.homeClubId) || clubs[0];
  const awayClub = clubs.find((c) => c.id === activeMatch?.awayClubId) || clubs[1];

  const currentScoringClub = selectedClubId
    ? clubs.find((c) => c.id === selectedClubId)
    : homeClub;

  const currentClubPlayers = players.filter((p) => p.clubId === currentScoringClub?.id);

  // Clock timer
  useEffect(() => {
    let interval: any;
    if (isClockRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockRunning]);

  const formatClock = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScoreTap = (ruleId: string) => {
    if (!activeMatch || !currentScoringClub) return;
    recordScoringEvent(activeMatch.id, currentScoringClub.id, ruleId, selectedPlayerId || undefined);
    playHapticFeedback();
  };

  const handleConfirmUndo = () => {
    if (!activeMatch) return;
    undoLastMatchEvent(activeMatch.id);
    setShowUndoConfirm(false);
    playHapticFeedback();
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-900 text-white select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-5 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="LIVE SCORING CONSOLE" />

        {/* Live Match Clock & State */}
        <div className="relative z-10 flex items-center justify-between mt-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-condensed text-4xl font-black font-tabular tracking-wider">
                {formatClock(secondsElapsed)}
              </span>
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-md bg-black text-[#C8F135]">
                {sport.periodLabel} {activeMatch?.currentPeriod || 1}
              </span>
            </div>
            <div className="text-[11px] uppercase font-bold text-black/70 mt-0.5">
              DATA-DRIVEN RULES: {sport.displayName}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClockRunning((p) => !p)}
              className="p-2.5 rounded-xl bg-[#0E0E12] text-white hover:bg-neutral-800 cursor-pointer"
            >
              {isClockRunning ? <Pause className="w-5 h-5 text-[#C8F135]" /> : <Play className="w-5 h-5 text-[#C8F135]" />}
            </button>
            <button
              type="button"
              onClick={() => setShowUndoConfirm(true)}
              className="p-2.5 rounded-xl bg-[#0E0E12] text-white hover:bg-neutral-800 cursor-pointer"
              title="Undo last scoring event"
            >
              <Undo2 className="w-5 h-5 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="px-4 mt-5">
        <div className="p-4 rounded-3xl bg-neutral-800/80 border border-white/10 flex items-center justify-between">
          {/* Home Club Selector */}
          <button
            type="button"
            onClick={() => {
              setSelectedClubId(homeClub.id);
              setSelectedPlayerId('');
              playHapticFeedback();
            }}
            className={`flex-1 p-3 rounded-2xl flex flex-col items-center transition-all cursor-pointer ${
              currentScoringClub?.id === homeClub.id
                ? 'bg-[#C8F135] text-black shadow-lg scale-102 font-bold'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <span className="font-condensed text-xs uppercase tracking-wider">HOME</span>
            <span className="font-condensed text-xl uppercase truncate max-w-[120px]">
              {homeClub.shortName}
            </span>
            <span className="font-condensed text-5xl font-black font-tabular mt-1">
              {activeMatch.homeScore}
            </span>
          </button>

          {/* Separator */}
          <div className="px-3 font-condensed text-2xl font-black text-white/30">
            VS
          </div>

          {/* Away Club Selector */}
          <button
            type="button"
            onClick={() => {
              setSelectedClubId(awayClub.id);
              setSelectedPlayerId('');
              playHapticFeedback();
            }}
            className={`flex-1 p-3 rounded-2xl flex flex-col items-center transition-all cursor-pointer ${
              currentScoringClub?.id === awayClub.id
                ? 'bg-[#C8F135] text-black shadow-lg scale-102 font-bold'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <span className="font-condensed text-xs uppercase tracking-wider">AWAY</span>
            <span className="font-condensed text-xl uppercase truncate max-w-[120px]">
              {awayClub.shortName}
            </span>
            <span className="font-condensed text-5xl font-black font-tabular mt-1">
              {activeMatch.awayScore}
            </span>
          </button>
        </div>
      </div>

      {/* Player Assigner (Optional for precision tracking) */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
            CREDIT SCORER ({currentScoringClub?.shortName})
          </span>
          {selectedPlayerId && (
            <button
              type="button"
              onClick={() => setSelectedPlayerId('')}
              className="text-[10px] text-neutral-400 underline cursor-pointer"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {currentClubPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                setSelectedPlayerId(player.id);
                playHapticFeedback();
              }}
              className={`px-3 py-1.5 rounded-full font-condensed text-sm uppercase whitespace-nowrap cursor-pointer transition-colors ${
                selectedPlayerId === player.id
                  ? 'bg-white text-black font-black'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              #{player.number} {player.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Giant One-Tap Scoring Action Buttons (Data-Driven per Sport Config) */}
      <div className="px-4 mt-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
          ONE-TAP SCORING EVENTS ({sport.name.toUpperCase()})
        </span>

        <div className="grid grid-cols-2 gap-3">
          {sport.scoringEvents.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => handleScoreTap(rule.id)}
              className={`btn-press p-5 rounded-2xl flex flex-col justify-between text-left shadow-lg cursor-pointer transition-transform active:scale-95 ${
                rule.isNegative
                  ? 'bg-[#F0503C] text-white hover:bg-rose-600'
                  : rule.points >= 3
                  ? 'bg-[#7B6CF2] text-white hover:bg-purple-600'
                  : 'bg-[#C8F135] text-black hover:opacity-90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-condensed text-3xl font-black font-tabular leading-none">
                  {rule.points > 0 ? `+${rule.points}` : 'CARD'}
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-xs bg-black/20">
                  TAP
                </span>
              </div>
              <div className="font-condensed text-xl font-bold uppercase tracking-wide mt-2">
                {rule.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Append-Only Event Log */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
            AUDIT EVENT LOG ({activeMatch.events.length})
          </span>
          {!isOnline && (
            <span className="text-[10px] font-bold text-[#F0503C]">
              OFFLINE BUFFER ACTIVE
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {activeMatch.events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#C8F135]">{evt.minute}&apos;</span>
                <span className="font-condensed text-base font-bold uppercase">{evt.label}</span>
                <span className="text-white/60">({evt.playerName})</span>
              </div>
              <span className="font-mono text-white/40">{evt.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Undo Confirmation Modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-neutral-900 rounded-3xl p-6 border border-white/10 text-white shadow-2xl">
            <h3 className="font-condensed text-2xl font-black uppercase mb-1">
              CONFIRM UNDO / CORRECTION
            </h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Undo the most recent scoring event? The score will automatically compensate and the
              action will be logged to the immutable audit trail.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUndoConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-condensed text-sm font-bold uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmUndo}
                className="flex-1 py-3 rounded-xl bg-[#F0503C] hover:bg-rose-700 text-white font-condensed text-sm font-black uppercase cursor-pointer"
              >
                YES, REVERT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
