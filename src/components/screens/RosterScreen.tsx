import React, { useState } from 'react';
import { UserPlus, ArrowRightLeft, UserMinus, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { RoundButton } from '../common/RoundButton';
import { BigActionButton } from '../common/BigActionButton';
import { Player } from '../../types/league';

export const RosterScreen: React.FC = () => {
  const {
    tenant,
    clubs,
    players,
    selectedClubId,
    addPlayerToRoster,
    transferPlayer,
    releasePlayer,
    isOnline,
    playHapticFeedback,
  } = useLeague();

  const club = clubs.find((c) => c.id === selectedClubId) || clubs[0];
  const squad = players.filter((p) => p.clubId === club.id);

  // Form & Sheet state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedPlayerToManage, setSelectedPlayerToManage] = useState<Player | null>(null);
  const [isReleaseConfirmOpen, setIsReleaseConfirmOpen] = useState(false);

  // New Player Form
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newPosition, setNewPosition] = useState('Attacking Midfielder');

  // Transfer Form
  const [destinationClubId, setDestinationClubId] = useState(clubs[1]?.id || '');

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = addPlayerToRoster(club.id, {
      name: newName.trim(),
      number: newNumber ? parseInt(newNumber, 10) : undefined,
      position: newPosition,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setIsAddModalOpen(false);
      setNewName('');
      setNewNumber('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleTransferSubmit = () => {
    if (!selectedPlayerToManage) return;
    const res = transferPlayer(selectedPlayerToManage.id, destinationClubId);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setIsTransferModalOpen(false);
      setSelectedPlayerToManage(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleReleaseSubmit = () => {
    if (!selectedPlayerToManage) return;
    const res = releasePlayer(selectedPlayerToManage.id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setIsReleaseConfirmOpen(false);
      setSelectedPlayerToManage(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-50 text-[#0E0E12] select-none">
      {/* Lime Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="SQUAD ROSTER MANAGEMENT" />

        <div className="relative z-10 flex items-center justify-between mt-3 px-1">
          <div>
            <div className="font-condensed text-5xl font-black uppercase leading-none">
              {club.name}
            </div>
            <div className="text-xs uppercase font-bold text-black/70 mt-1">
              ROSTER QUOTA: {squad.length} / 25 REGISTERED ATHLETES
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              playHapticFeedback();
            }}
            className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0E0E12] text-white font-condensed text-base font-bold uppercase shadow-sm cursor-pointer hover:bg-neutral-800"
          >
            <UserPlus className="w-4 h-4 text-[#C8F135]" />
            <span>ADD ATHLETE</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {feedback && (
        <div className="px-4 mt-4">
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Roster List */}
      <div className="px-4 mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-neutral-400 px-1">
          <span>ATHLETE PROFILE</span>
          <span>QUICK ACTIONS</span>
        </div>

        {squad.map((player) => (
          <div
            key={player.id}
            className="p-4 rounded-3xl bg-white border border-neutral-100 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                style={{ borderColor: player.avatarRingColor }}
                className="w-12 h-12 rounded-full border-2 bg-neutral-900 text-white flex items-center justify-center font-condensed text-lg font-bold shrink-0"
              >
                #{player.number}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-condensed text-xl font-bold uppercase text-[#0E0E12]">
                    {player.name}
                  </span>
                  {player.isCaptain && (
                    <span className="px-1.5 py-0.2 rounded-xs bg-[#C8F135] text-black text-[9px] font-black uppercase">
                      CAPTAIN
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-0.5">
                  {player.position} · Rating {player.stats.rating}
                </div>
              </div>
            </div>

            {/* Manager Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlayerToManage(player);
                  setIsTransferModalOpen(true);
                  playHapticFeedback();
                }}
                className="btn-press px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-condensed text-xs font-bold uppercase cursor-pointer"
                title="Transfer player to another club"
              >
                TRANSFER
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlayerToManage(player);
                  setIsReleaseConfirmOpen(true);
                  playHapticFeedback();
                }}
                className="btn-press px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-condensed text-xs font-bold uppercase cursor-pointer"
                title="Release player to free agency"
              >
                RELEASE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="font-condensed text-3xl font-black uppercase mb-1">
              REGISTER NEW ATHLETE
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Add a new squad member subject to league roster validation rules.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. MARCUS THURAM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 font-condensed text-lg uppercase font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                    JERSEY NUMBER
                  </label>
                  <input
                    type="number"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g. 11"
                    min="1"
                    max="99"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 font-condensed text-lg uppercase font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                    POSITION
                  </label>
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-neutral-100 text-xs font-bold uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="Wide Receiver / Midfielder">Wide Receiver / Midfielder</option>
                    <option value="Tight End / Forward">Tight End / Forward</option>
                    <option value="Defensive End / Center Back">Defensive End / Center Back</option>
                    <option value="Split End / Winger">Split End / Winger</option>
                    <option value="Kicker / Goalkeeper">Kicker / Goalkeeper</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-condensed text-base font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#C8F135] text-black font-condensed text-base font-black uppercase cursor-pointer hover:opacity-90"
                >
                  CONFIRM & REGISTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Player Modal */}
      {isTransferModalOpen && selectedPlayerToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="font-condensed text-3xl font-black uppercase mb-1">
              TRANSFER ATHLETE
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Transferring <span className="font-bold text-black">{selectedPlayerToManage.name}</span> to another club.
            </p>

            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                DESTINATION CLUB
              </label>
              <select
                value={destinationClubId}
                onChange={(e) => setDestinationClubId(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-neutral-100 text-sm font-bold uppercase focus:outline-none cursor-pointer"
              >
                {clubs
                  .filter((c) => c.id !== club.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-condensed text-base font-bold uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleTransferSubmit}
                className="flex-1 py-3 rounded-xl bg-[#7B6CF2] text-white font-condensed text-base font-black uppercase cursor-pointer hover:opacity-90"
              >
                COMPLETE TRANSFER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release Confirmation Modal */}
      {isReleaseConfirmOpen && selectedPlayerToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-[#0E0E12]">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="font-condensed text-3xl font-black uppercase">CONFIRM RELEASE</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Are you sure you want to release{' '}
              <span className="font-bold text-black">{selectedPlayerToManage.name}</span> (#{selectedPlayerToManage.number}) to free agency? This action removes them from the club roster.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsReleaseConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-condensed text-base font-bold uppercase cursor-pointer"
              >
                KEEP ON ROSTER
              </button>
              <button
                type="button"
                onClick={handleReleaseSubmit}
                className="flex-1 py-3 rounded-xl bg-[#F0503C] text-white font-condensed text-base font-black uppercase cursor-pointer hover:bg-rose-700"
              >
                YES, RELEASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
