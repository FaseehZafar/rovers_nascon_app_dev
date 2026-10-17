import React from 'react';
import { Home, Calendar, Trophy, ShoppingBag, Layers } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';

export const FloatingTabBar: React.FC = () => {
  const { activeScreen, setActiveScreen, cart, playHapticFeedback, tenant } = useLeague();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'store', label: 'Store', icon: ShoppingBag, badge: totalCartCount },
    { id: 'more', label: 'More', icon: Layers },
  ];

  const handleSelect = (id: string) => {
    playHapticFeedback();
    setActiveScreen(id);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none select-none">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full bg-[#0E0E12]/95 text-white shadow-2xl border border-white/10 backdrop-blur-md max-w-sm w-full"
      >
        {tabs.map((tab) => {
          const isActive =
            activeScreen === tab.id ||
            (tab.id === 'fixtures' && activeScreen === 'match-detail') ||
            (tab.id === 'more' && ['stadium3d', 'medialab', 'sync', 'admin', 'roster', 'scoring'].includes(activeScreen));
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all duration-200 cursor-pointer ${
                isActive ? 'text-[#0E0E12] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {/* Active sliding pill background */}
              {isActive && (
                <div
                  style={{ backgroundColor: tenant.colors.primary }}
                  className="absolute inset-0 rounded-full shadow-md animate-fade-in"
                />
              )}

              {/* Icon & Label */}
              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] uppercase font-condensed tracking-wider mt-0.5 leading-none">
                  {tab.label}
                </span>

                {/* Badge for cart */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#F0503C] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
