import React from 'react';
import { Box, Sparkles, Users, Play, RefreshCw, Shield, Globe, Settings, Trophy, ChevronRight } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';

export const MoreHubScreen: React.FC = () => {
  const { tenant, role, switchRole, switchTenant, setActiveScreen, playHapticFeedback } = useLeague();

  const menuItems = [
    {
      id: 'stadium3d',
      title: '3D Stadium & Tactic Lab',
      desc: 'Three.js 60fps PBR arena, composite procedural stadium, camera views',
      icon: Box,
      color: '#7B6CF2',
      badge: 'THREE.JS',
    },
    {
      id: 'medialab',
      title: 'AI Media Lab & Creative Studio',
      desc: 'Generate artwork with Nano Banana 2.1 and animate video with Veo',
      icon: Sparkles,
      color: '#C8F135',
      badge: 'GEMINI & VEO',
    },
    {
      id: 'roster',
      title: 'Squad Roster Management',
      desc: 'Club manager controls: add athletes, transfers, loans, release validation',
      icon: Users,
      color: '#0E0E12',
      badge: 'MANAGER',
    },
    {
      id: 'scoring',
      title: 'Live Match Scoring Console',
      desc: 'One-tap scoring events, live clock, undo & compensating audit log',
      icon: Play,
      color: '#C8F135',
      badge: 'ORGANIZER',
    },
    {
      id: 'sync',
      title: 'Offline Action Queue & Sync',
      desc: 'Persistent local event buffer, airplane simulation, conflict resolution',
      icon: RefreshCw,
      color: '#7B6CF2',
      badge: 'OFFLINE',
    },
    {
      id: 'admin',
      title: 'Admin Sport JSON Schema',
      desc: 'Data-driven rule definition engine with zero code branching',
      icon: Shield,
      color: '#0E0E12',
      badge: 'SUPER-ADMIN',
    },
  ];

  const handleSelect = (id: string) => {
    setActiveScreen(id);
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
        <Header variant="lime" title="LEAGUE HUB APPS" />

        <div className="relative z-10 mt-3 px-1">
          <div className="font-condensed text-5xl font-black uppercase leading-none">
            MORE SERVICES
          </div>
          <div className="text-xs uppercase font-bold text-black/70 mt-1">
            ADVANCED LEAGUE MODULES & SYSTEM TOOLS
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="btn-press p-4 rounded-3xl bg-white border border-neutral-100 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  style={{ backgroundColor: `${item.color}25` }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <Icon className="w-6 h-6 text-[#0E0E12]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-condensed text-xl font-bold uppercase text-[#0E0E12]">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-xs bg-neutral-100 text-neutral-600 font-condensed text-[10px] font-black uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 font-medium line-clamp-1 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Tenant Switcher Card */}
      <div className="px-4 mt-6">
        <div className="p-4 rounded-3xl bg-white border border-neutral-100 shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
            WHITE-LABEL TENANT THEME
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchTenant('tenant-alpha')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                tenant.id === 'tenant-alpha'
                  ? 'border-black bg-[#C8F135]/20'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="font-condensed text-lg font-black uppercase text-[#0E0E12]">
                APEX LEAGUE
              </div>
              <div className="text-xs text-neutral-500">Lime & Violet Theme</div>
            </button>
            <button
              type="button"
              onClick={() => switchTenant('tenant-beta')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                tenant.id === 'tenant-beta'
                  ? 'border-black bg-[#FF6452]/20'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="font-condensed text-lg font-black uppercase text-[#0E0E12]">
                METRO CIRCUIT
              </div>
              <div className="text-xs text-neutral-500">Coral & Cyan Theme</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
