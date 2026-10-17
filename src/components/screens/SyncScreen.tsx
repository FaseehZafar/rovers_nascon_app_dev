import React, { useState } from 'react';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { BigActionButton } from '../common/BigActionButton';

export const SyncScreen: React.FC = () => {
  const {
    tenant,
    isOnline,
    offlineQueue,
    toggleOnlineMode,
    syncOfflineQueue,
    setActiveScreen,
    playHapticFeedback,
  } = useLeague();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);

  const pendingCount = offlineQueue.filter((q) => q.status === 'pending').length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    playHapticFeedback();
    const count = await syncOfflineQueue();
    setIsSyncing(false);
    setSyncedMessage(`Successfully synchronized ${count} offline operations with league ledger.`);
    setTimeout(() => setSyncedMessage(null), 4000);
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-50 text-[#0E0E12] select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: tenant.colors.secondary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-white overflow-hidden"
      >
        <HalftoneOverlay variant="violet" opacity={0.25} />
        <Header variant="violet" title="OFFLINE & SYNC QUEUE" />

        <div className="relative z-10 mt-3 px-1">
          <div className="font-condensed text-5xl font-black uppercase leading-none">
            OFFLINE LEDGER
          </div>
          <div className="text-xs uppercase font-bold text-white/80 mt-1">
            IMMUTABLE EVENT BUFFER & SYNC ORCHESTRATION
          </div>
        </div>
      </div>

      {/* Connection Mode Card */}
      <div className="px-4 mt-6">
        <div className="p-4 rounded-3xl bg-white border border-neutral-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="font-condensed text-2xl font-bold uppercase leading-none text-[#0E0E12]">
                {isOnline ? 'ONLINE STATUS ACTIVE' : 'AIRPLANE MODE SIMULATION'}
              </div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                {isOnline
                  ? 'All roster and scoring actions sync in real-time.'
                  : 'Actions are queued safely in persistent local storage.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleOnlineMode}
            className={`px-3.5 py-2 rounded-xl font-condensed text-sm font-bold uppercase transition-colors cursor-pointer ${
              isOnline
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-[#F0503C] text-white hover:bg-rose-600'
            }`}
          >
            {isOnline ? 'SIMULATE OFFLINE' : 'RECONNECT'}
          </button>
        </div>
      </div>

      {/* Sync Action Area */}
      <div className="px-4 mt-4">
        {syncedMessage && (
          <div className="mb-3 p-3.5 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncedMessage}</span>
          </div>
        )}

        <BigActionButton
          label={isSyncing ? 'SYNCING QUEUE...' : `SYNC NOW (${pendingCount} PENDING)`}
          variant="lime"
          disabled={isSyncing || pendingCount === 0 || !isOnline}
          onClick={handleManualSync}
        />
        {!isOnline && pendingCount > 0 && (
          <p className="text-[11px] text-center text-neutral-400 font-medium mt-1.5">
            Reconnect to the network before synchronizing offline actions.
          </p>
        )}
      </div>

      {/* Queued Actions List */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-condensed text-xl font-bold uppercase text-[#0E0E12]">
            BUFFERED ACTIONS ({offlineQueue.length})
          </span>
          <span className="text-xs font-semibold text-neutral-400">PERSISTENT CACHE</span>
        </div>

        {offlineQueue.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-neutral-100 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-condensed text-2xl font-bold uppercase text-[#0E0E12]">
              QUEUE IS UP TO DATE
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              No offline operations pending. Test by tapping &apos;Simulate Offline&apos; and making a roster or scoring action.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {offlineQueue.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-white border border-neutral-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      act.status === 'synced'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {act.status === 'synced' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-condensed text-base font-bold uppercase text-[#0E0E12] leading-tight">
                      {act.resultDescription}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {act.actionType} · {new Date(act.queuedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md font-condensed text-xs uppercase font-extrabold ${
                    act.status === 'synced'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
