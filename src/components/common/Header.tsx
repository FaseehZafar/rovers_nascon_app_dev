import React, { useState } from 'react';
import { Menu, Wifi, WifiOff, RefreshCw, X, Shield, Globe, Users, Trophy, Box } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { RoundButton } from './RoundButton';
import { UserRole } from '../../types/league';

interface HeaderProps {
  variant?: 'lime' | 'violet' | 'dark';
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'lime',
  title,
  showBack = false,
  onBack,
}) => {
  const {
    tenant,
    role,
    sport,
    sports,
    isOnline,
    offlineQueue,
    switchTenant,
    switchRole,
    switchSport,
    setActiveScreen,
    toggleOnlineMode,
    syncOfflineQueue,
  } = useLeague();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingCount = offlineQueue.filter((q) => q.status === 'pending').length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueue();
    setIsSyncing(false);
  };

  const roles: { id: UserRole; label: string; badge: string }[] = [
    { id: 'super-admin', label: 'Super-Admin', badge: 'CONFIG' },
    { id: 'organizer', label: 'League Organizer', badge: 'SCORE' },
    { id: 'manager', label: 'Club Manager', badge: 'ROSTER' },
    { id: 'player', label: 'Player', badge: 'ATHLETE' },
    { id: 'viewer', label: 'Viewer / Fan', badge: 'STREAM' },
  ];

  return (
    <>
      <header className="relative z-30 flex items-center justify-between px-4 py-3 select-none">
        {/* Left: Crest or Back Button */}
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <RoundButton
              size="md"
              variant={variant === 'lime' ? 'translucent' : 'white'}
              onClick={onBack}
              ariaLabel="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </RoundButton>
          ) : (
            <button
              type="button"
              onClick={() => setActiveScreen('home')}
              className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md p-1 border-2 border-white/60 shrink-0">
                <div
                  style={{ backgroundColor: tenant.colors.primary }}
                  className="w-full h-full rounded-full flex items-center justify-center font-condensed text-base font-black text-black"
                >
                  {tenant.shortCode}
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-condensed text-xs uppercase tracking-wider text-black/70 font-bold">
                  {tenant.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-black/50 leading-none">
                  {sport.name}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Center: Title or Network & Sync Indicator */}
        <div className="flex items-center gap-2">
          {title ? (
            <h1 className="font-condensed text-xl sm:text-2xl font-bold uppercase tracking-wide truncate max-w-[180px] sm:max-w-xs text-center">
              {title}
            </h1>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Online / Offline status toggle */}
              <button
                type="button"
                onClick={toggleOnlineMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isOnline
                    ? 'bg-black/10 text-black hover:bg-black/15'
                    : 'bg-[#F0503C] text-white shadow-xs animate-pulse'
                }`}
                title="Tap to toggle airplane/offline mode simulation"
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>ONLINE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>AIRPLANE ({pendingCount})</span>
                  </>
                )}
              </button>

              {/* Sync queue trigger if items pending */}
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white text-black shadow-xs cursor-pointer hover:bg-neutral-100"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>SYNC</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Round Menu Button */}
        <div className="flex items-center gap-2">
          {/* Quick role badge */}
          <span className="hidden md:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/15 text-black">
            {role.toUpperCase()}
          </span>

          <RoundButton
            size="md"
            variant={variant === 'lime' ? 'translucent' : 'white'}
            onClick={() => setIsMenuOpen(true)}
            ariaLabel="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </RoundButton>
        </div>
      </header>

      {/* Slide-over / Modal Navigation Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: tenant.colors.primary }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-condensed text-xl font-black text-black"
                >
                  {tenant.shortCode}
                </div>
                <div>
                  <h3 className="font-condensed text-xl uppercase font-black text-[#0E0E12] leading-none">
                    LEAGUE HUB
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">{tenant.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch Demo Role */}
            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                ACTIVE USER ROLE
              </div>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      switchRole(r.id);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      role === r.id
                        ? 'bg-[#0E0E12] text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <span className="text-sm font-semibold">{r.label}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        role === r.id ? 'bg-[#C8F135] text-black' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {r.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Sport */}
            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                SELECT SPORT (DATA-DRIVEN)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sports.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => switchSport(s.id)}
                    className={`px-3 py-2.5 rounded-xl font-condensed text-base uppercase text-left transition-all cursor-pointer ${
                      sport.id === s.id
                        ? 'bg-[#7B6CF2] text-white font-bold'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Tenant */}
            <div className="mt-6">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                WHITE-LABEL TENANT
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchTenant('tenant-alpha')}
                  className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                    tenant.id === 'tenant-alpha'
                      ? 'border-[#0E0E12] bg-[#C8F135]/15'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-condensed text-sm font-bold uppercase text-[#0E0E12]">
                    APEX LEAGUE
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">Lime & Violet</div>
                </button>
                <button
                  type="button"
                  onClick={() => switchTenant('tenant-beta')}
                  className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                    tenant.id === 'tenant-beta'
                      ? 'border-[#0E0E12] bg-[#FF6452]/15'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-condensed text-sm font-bold uppercase text-[#0E0E12]">
                    METRO CIRCUIT
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">Coral & Cyan</div>
                </button>
              </div>
            </div>

            {/* Quick Feature Jump Links */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('stadium3d');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-bold cursor-pointer"
              >
                <Box className="w-4 h-4 text-[#7B6CF2]" />
                <span>3D Stadium & Tactic Lab (Three.js)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveScreen('medialab');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-bold cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#C8F135]" />
                <span>AI Media Lab (Nano Banana 2.1 & Veo)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveScreen('sync');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-bold cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-neutral-600" />
                <span>Offline Sync Queue ({pendingCount})</span>
              </button>

              {role === 'super-admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen('admin');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black text-[#C8F135] text-sm font-bold cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Sport JSON Schema</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
