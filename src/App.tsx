import React, { useState } from 'react';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { FixturesScreen } from './components/screens/FixturesScreen';
import { MatchDetailScreen } from './components/screens/MatchDetailScreen';
import { StandingsScreen } from './components/screens/StandingsScreen';
import { ClubProfileScreen } from './components/screens/ClubProfileScreen';
import { StoreScreen } from './components/screens/StoreScreen';
import { RosterScreen } from './components/screens/RosterScreen';
import { ScoringScreen } from './components/screens/ScoringScreen';
import { Stadium3DScreen } from './components/screens/Stadium3DScreen';
import { MediaLabScreen } from './components/screens/MediaLabScreen';
import { SyncScreen } from './components/screens/SyncScreen';
import { AdminSportScreen } from './components/screens/AdminSportScreen';
import { MoreHubScreen } from './components/screens/MoreHubScreen';
import { FloatingTabBar } from './components/common/FloatingTabBar';
import { Smartphone, Monitor } from 'lucide-react';

const ScreenRenderer: React.FC = () => {
  const { activeScreen } = useLeague();

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'fixtures':
        return <FixturesScreen />;
      case 'match-detail':
        return <MatchDetailScreen />;
      case 'standings':
        return <StandingsScreen />;
      case 'club-profile':
        return <ClubProfileScreen />;
      case 'store':
        return <StoreScreen />;
      case 'roster':
        return <RosterScreen />;
      case 'scoring':
        return <ScoringScreen />;
      case 'stadium3d':
        return <Stadium3DScreen />;
      case 'medialab':
        return <MediaLabScreen />;
      case 'sync':
        return <SyncScreen />;
      case 'admin':
        return <AdminSportScreen />;
      case 'more':
        return <MoreHubScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isFullBleed3D = activeScreen === 'stadium3d';

  return (
    <div className="relative w-full min-h-screen bg-[#0E0E12] flex justify-center">
      {/* Container simulating native phone container on large screens or full width on mobile */}
      <main className="w-full max-w-md min-h-screen bg-white relative shadow-2xl flex flex-col overflow-x-hidden">
        {renderCurrentScreen()}
        {!isFullBleed3D && <FloatingTabBar />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <LeagueProvider>
      <ScreenRenderer />
    </LeagueProvider>
  );
}
