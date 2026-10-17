import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  TenantConfig,
  SportConfig,
  Club,
  Player,
  Match,
  MatchEvent,
  StandingsRow,
  StoreProduct,
  CartItem,
  OrderReceipt,
  OfflineAction,
} from '../types/league';
import { TENANTS, SPORTS, CLUBS, PLAYERS, MATCHES, STANDINGS, PRODUCTS } from '../data/initialData';

interface LeagueContextType {
  tenant: TenantConfig;
  role: UserRole;
  sport: SportConfig;
  sports: SportConfig[];
  clubs: Club[];
  players: Player[];
  matches: Match[];
  standings: StandingsRow[];
  products: StoreProduct[];
  cart: CartItem[];
  offlineQueue: OfflineAction[];
  isOnline: boolean;
  searchQuery: string;
  activeScreen: string;
  selectedClubId: string | null;
  selectedMatchId: string | null;
  selectedPlayerId: string | null;
  lastReceipt: OrderReceipt | null;
  setSearchQuery: (query: string) => void;
  setActiveScreen: (screen: string) => void;
  setSelectedClubId: (clubId: string | null) => void;
  setSelectedMatchId: (matchId: string | null) => void;
  setSelectedPlayerId: (playerId: string | null) => void;
  switchTenant: (tenantId: 'tenant-alpha' | 'tenant-beta') => void;
  switchRole: (role: UserRole) => void;
  switchSport: (sportId: string) => void;
  recordScoringEvent: (matchId: string, clubId: string, ruleId: string, playerId?: string) => void;
  undoLastMatchEvent: (matchId: string) => void;
  addPlayerToRoster: (clubId: string, playerData: Partial<Player>) => { success: boolean; message: string };
  transferPlayer: (playerId: string, toClubId: string) => { success: boolean; message: string };
  releasePlayer: (playerId: string) => { success: boolean; message: string };
  addToCart: (product: StoreProduct, size: string, color: string, qty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  checkoutOrder: (paymentMethod: string, discountCode?: string) => OrderReceipt;
  syncOfflineQueue: () => Promise<number>;
  toggleOnlineMode: () => void;
  resetDatabase: () => void;
  updateSportConfig: (config: SportConfig) => void;
  playHapticFeedback: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const STORAGE_KEYS = {
  QUEUE: 'league_offline_queue_v1',
  CLUBS: 'league_clubs_v1',
  MATCHES: 'league_matches_v1',
  PLAYERS: 'league_players_v1',
  TENANT: 'league_tenant_id_v1',
  ROLE: 'league_user_role_v1',
};

export const LeagueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<'tenant-alpha' | 'tenant-beta'>('tenant-alpha');
  const [role, setRole] = useState<UserRole>('viewer');
  const [sports, setSports] = useState<SportConfig[]>(SPORTS);
  const [sportId, setSportId] = useState<string>('sport-football');

  const [clubs, setClubs] = useState<Club[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLUBS);
    return saved ? JSON.parse(saved) : CLUBS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : PLAYERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return saved ? JSON.parse(saved) : MATCHES;
  });

  const [standings, setStandings] = useState<StandingsRow[]>(STANDINGS);
  const [products] = useState<StoreProduct[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return saved ? JSON.parse(saved) : [];
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeScreen, setActiveScreenState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('screen');
      if (s) return s;
    }
    return 'home';
  });

  const setActiveScreen = (screen: string) => {
    setActiveScreenState(screen);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', screen);
      window.history.replaceState({}, '', url.toString());
    }
  };
  const [selectedClubId, setSelectedClubId] = useState<string | null>('demo-club-raiders');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>('demo-match-live-1');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>('demo-player-1');
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Recalculate standings dynamically when matches change
  useEffect(() => {
    const clubStats: Record<string, { p: number; w: number; d: number; l: number; pf: number; pa: number; pts: number }> = {};
    clubs.forEach((c) => {
      clubStats[c.id] = { p: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0, pts: 0 };
    });

    matches.forEach((m) => {
      if (m.status === 'completed' || m.status === 'live') {
        const h = clubStats[m.homeClubId] || { p: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0, pts: 0 };
        const a = clubStats[m.awayClubId] || { p: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0, pts: 0 };

        h.p += 1;
        a.p += 1;
        h.pf += m.homeScore;
        h.pa += m.awayScore;
        a.pf += m.awayScore;
        a.pa += m.homeScore;

        if (m.homeScore > m.awayScore) {
          h.w += 1;
          h.pts += 3;
          a.l += 1;
        } else if (m.homeScore < m.awayScore) {
          a.w += 1;
          a.pts += 3;
          h.l += 1;
        } else {
          h.d += 1;
          a.d += 1;
          h.pts += 1;
          a.pts += 1;
        }
        clubStats[m.homeClubId] = h;
        clubStats[m.awayClubId] = a;
      }
    });

    const rows: StandingsRow[] = Object.keys(clubStats).map((cid) => {
      const s = clubStats[cid];
      return {
        rank: 1,
        previousRank: 1,
        clubId: cid,
        played: s.p,
        won: s.w,
        drawn: s.d,
        lost: s.l,
        pointsFor: s.pf,
        pointsAgainst: s.pa,
        pointsDiff: s.pf - s.pa,
        points: s.pts,
        qualification: 'possible',
      };
    });

    // Sort by points desc, points diff desc, points for desc
    rows.sort((a, b) => b.points - a.points || b.pointsDiff - a.pointsDiff || b.pointsFor - a.pointsFor);

    // Assign ranks and qualifications
    const total = rows.length;
    rows.forEach((r, idx) => {
      r.rank = idx + 1;
      if (idx === 0) r.qualification = 'clinched';
      else if (idx === total - 1 && total > 2) r.qualification = 'eliminated';
      else r.qualification = 'possible';
    });

    setStandings(rows);
  }, [matches, clubs]);

  const tenant = TENANTS[tenantId] || TENANTS['tenant-alpha'];
  const sport = sports.find((s) => s.id === sportId) || sports[0];

  const playHapticFeedback = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        // Safe ignore
      }
    }
  };

  const switchTenant = (tId: 'tenant-alpha' | 'tenant-beta') => {
    setTenantId(tId);
    playHapticFeedback();
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    playHapticFeedback();
  };

  const switchSport = (sId: string) => {
    setSportId(sId);
    playHapticFeedback();
  };

  const toggleOnlineMode = () => {
    setIsOnline((prev) => !prev);
    playHapticFeedback();
  };

  // Scoring Event
  const recordScoringEvent = (matchId: string, clubId: string, ruleId: string, playerId?: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const currentSport = sports.find((s) => s.id === targetMatch.sportId) || sport;
    const rule = currentSport.scoringEvents.find((r) => r.id === ruleId);
    if (!rule) return;

    const playerObj = playerId ? players.find((p) => p.id === playerId) : undefined;
    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      matchId,
      minute: 72,
      period: targetMatch.currentPeriod,
      clubId,
      playerId,
      playerName: playerObj ? playerObj.name : 'Team Play',
      type: rule.id,
      label: `${rule.label}${rule.points > 0 ? ` (+${rule.points})` : ''}`,
      points: rule.points,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const isHome = targetMatch.homeClubId === clubId;
    const updatedHomeScore = isHome ? targetMatch.homeScore + rule.points : targetMatch.homeScore;
    const updatedAwayScore = !isHome ? targetMatch.awayScore + rule.points : targetMatch.awayScore;

    if (!isOnline) {
      // Queue offline
      const action: OfflineAction = {
        id: `offline-act-${Date.now()}`,
        actionType: 'SCORE_MATCH',
        payload: { matchId, newEvent, updatedHomeScore, updatedAwayScore },
        queuedAt: new Date().toISOString(),
        status: 'pending',
        resultDescription: `Queued: ${rule.label} for ${clubId === targetMatch.homeClubId ? 'Home' : 'Away'} (${targetMatch.homeScore} - ${targetMatch.awayScore})`,
      };
      setOfflineQueue((prev) => [action, ...prev]);
    }

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          homeScore: updatedHomeScore,
          awayScore: updatedAwayScore,
          events: [newEvent, ...m.events],
        };
      })
    );
    playHapticFeedback();
  };

  // Undo Last Match Event
  const undoLastMatchEvent = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId || m.events.length === 0) return m;
        const [lastEvent, ...remainingEvents] = m.events;
        const isHome = m.homeClubId === lastEvent.clubId;
        const revertedHome = isHome ? Math.max(0, m.homeScore - lastEvent.points) : m.homeScore;
        const revertedAway = !isHome ? Math.max(0, m.awayScore - lastEvent.points) : m.awayScore;
        return {
          ...m,
          homeScore: revertedHome,
          awayScore: revertedAway,
          events: remainingEvents,
        };
      })
    );
    playHapticFeedback();
  };

  // Roster Management
  const addPlayerToRoster = (clubId: string, playerData: Partial<Player>): { success: boolean; message: string } => {
    const clubPlayers = players.filter((p) => p.clubId === clubId);
    if (clubPlayers.length >= 25) {
      return { success: false, message: 'Squad capacity reached: Maximum 25 players registered per club.' };
    }

    const newNum = playerData.number || Math.floor(Math.random() * 88) + 10;
    const existingNum = clubPlayers.find((p) => p.number === newNum);
    if (existingNum) {
      return { success: false, message: `Jersey number ${newNum} is already assigned to ${existingNum.name}.` };
    }

    const initials = (playerData.name || 'NEW PLAYER')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const createdPlayer: Player = {
      id: `player-${Date.now()}`,
      clubId,
      name: (playerData.name || 'NEW SQUAD PLAYER').toUpperCase(),
      number: newNum,
      position: playerData.position || 'Forward / Specialist',
      roleDescription: playerData.roleDescription || 'Squad Prospect',
      isCaptain: false,
      avatarRingColor: tenant.colors.primary,
      avatarInitials: initials,
      stats: {
        speed: '4.35 SEC',
        power: '240 FT',
        stamina: '92%',
        rating: 84,
        matchesPlayed: 0,
        primaryMetric: 0,
        secondaryMetric: 0,
      },
    };

    if (!isOnline) {
      const action: OfflineAction = {
        id: `offline-act-${Date.now()}`,
        actionType: 'ROSTER_ADD',
        payload: createdPlayer,
        queuedAt: new Date().toISOString(),
        status: 'pending',
        resultDescription: `Queued: Register ${createdPlayer.name} (#${createdPlayer.number})`,
      };
      setOfflineQueue((prev) => [action, ...prev]);
    }

    setPlayers((prev) => [createdPlayer, ...prev]);
    playHapticFeedback();
    return { success: true, message: `Successfully registered ${createdPlayer.name} to the active roster.` };
  };

  const transferPlayer = (playerId: string, toClubId: string): { success: boolean; message: string } => {
    const targetPlayer = players.find((p) => p.id === playerId);
    const toClub = clubs.find((c) => c.id === toClubId);
    if (!targetPlayer || !toClub) {
      return { success: false, message: 'Invalid player or destination club.' };
    }

    if (!isOnline) {
      const action: OfflineAction = {
        id: `offline-act-${Date.now()}`,
        actionType: 'ROSTER_TRANSFER',
        payload: { playerId, toClubId },
        queuedAt: new Date().toISOString(),
        status: 'pending',
        resultDescription: `Queued: Transfer ${targetPlayer.name} to ${toClub.shortName}`,
      };
      setOfflineQueue((prev) => [action, ...prev]);
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, clubId: toClubId } : p))
    );
    playHapticFeedback();
    return { success: true, message: `Transferred ${targetPlayer.name} to ${toClub.name}.` };
  };

  const releasePlayer = (playerId: string): { success: boolean; message: string } => {
    const targetPlayer = players.find((p) => p.id === playerId);
    if (!targetPlayer) {
      return { success: false, message: 'Player not found.' };
    }

    if (!isOnline) {
      const action: OfflineAction = {
        id: `offline-act-${Date.now()}`,
        actionType: 'ROSTER_RELEASE',
        payload: { playerId },
        queuedAt: new Date().toISOString(),
        status: 'pending',
        resultDescription: `Queued: Release ${targetPlayer.name} to free agency`,
      };
      setOfflineQueue((prev) => [action, ...prev]);
    }

    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    playHapticFeedback();
    return { success: true, message: `Released ${targetPlayer.name} to free agency.` };
  };

  // Cart & Merch
  const addToCart = (product: StoreProduct, size: string, color: string, qty: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: qty }];
    });
    playHapticFeedback();
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    playHapticFeedback();
  };

  const clearCart = () => setCart([]);

  const checkoutOrder = (paymentMethod: string, discountCode?: string): OrderReceipt => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    if (discountCode && discountCode.trim().toUpperCase() === 'LEAGUE10') {
      discount = subtotal * 0.1;
    } else if (discountCode && discountCode.trim().toUpperCase() === 'CHAMPION20') {
      discount = subtotal * 0.2;
    }

    const total = Math.max(0, subtotal - discount);
    const receipt: OrderReceipt = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toLocaleString(),
      tenantName: tenant.name,
      items: cart.map((i) => ({
        title: i.product.title,
        variant: `${i.selectedSize} · ${i.selectedColor}`,
        quantity: i.quantity,
        price: i.product.price,
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      hmacSignature: `SHA256-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`,
      customerRole: role,
    };

    setLastReceipt(receipt);
    clearCart();
    playHapticFeedback();
    return receipt;
  };

  // Offline Sync
  const syncOfflineQueue = async (): Promise<number> => {
    if (offlineQueue.length === 0) return 0;
    const count = offlineQueue.length;

    // Simulate batch sync
    await new Promise((r) => setTimeout(r, 650));
    setOfflineQueue((prev) =>
      prev.map((act) => ({
        ...act,
        status: 'synced',
        resultDescription: `Synced: ${act.resultDescription.replace('Queued: ', '')}`,
      }))
    );

    setTimeout(() => {
      setOfflineQueue([]);
    }, 2000);

    playHapticFeedback();
    return count;
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEYS.CLUBS);
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    setClubs(CLUBS);
    setPlayers(PLAYERS);
    setMatches(MATCHES);
    setStandings(STANDINGS);
    setOfflineQueue([]);
    setCart([]);
    playHapticFeedback();
  };

  const updateSportConfig = (newSport: SportConfig) => {
    setSports((prev) => {
      const exists = prev.some((s) => s.id === newSport.id);
      if (exists) {
        return prev.map((s) => (s.id === newSport.id ? newSport : s));
      }
      return [...prev, newSport];
    });
    playHapticFeedback();
  };

  return (
    <LeagueContext.Provider
      value={{
        tenant,
        role,
        sport,
        sports,
        clubs,
        players,
        matches,
        standings,
        products,
        cart,
        offlineQueue,
        isOnline,
        searchQuery,
        activeScreen,
        selectedClubId,
        selectedMatchId,
        selectedPlayerId,
        lastReceipt,
        setSearchQuery,
        setActiveScreen,
        setSelectedClubId,
        setSelectedMatchId,
        setSelectedPlayerId,
        switchTenant,
        switchRole,
        switchSport,
        recordScoringEvent,
        undoLastMatchEvent,
        addPlayerToRoster,
        transferPlayer,
        releasePlayer,
        addToCart,
        removeFromCart,
        clearCart,
        checkoutOrder,
        syncOfflineQueue,
        toggleOnlineMode,
        resetDatabase,
        updateSportConfig,
        playHapticFeedback,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};
