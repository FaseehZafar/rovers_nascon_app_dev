export type UserRole = 'super-admin' | 'organizer' | 'manager' | 'player' | 'viewer';

export interface TenantConfig {
  id: 'tenant-alpha' | 'tenant-beta';
  name: string;
  tagline: string;
  shortCode: string;
  colors: {
    primary: string; // e.g. #C8F135 (Lime) or #FF6452 (Coral)
    primaryHover: string;
    secondary: string; // e.g. #7B6CF2 (Violet) or #38BDF8 (Sky Cyan)
    secondarySoft: string; // e.g. #D9D4FA
    toneOnTone: string; // e.g. #7FA318 or #B43424
    bgLight: string;
    textDark: string;
    danger: string;
  };
}

export interface ScoringRule {
  id: string;
  label: string;
  points: number;
  badgeColor?: string;
  isNegative?: boolean;
}

export interface SportConfig {
  id: string;
  name: string;
  displayName: string;
  category: 'team-ball' | 'innings' | 'esports' | 'combat';
  periodLabel: string; // e.g. "Half", "Quarter", "Innings", "Round"
  totalPeriods: number;
  periodDurationMinutes: number;
  scoringEvents: ScoringRule[];
  scoreLayout: 'standard' | 'innings' | 'rounds';
  primaryStatLabel: string;
  secondaryStatLabel: string;
}

export interface PlayerStats {
  speed: string;
  power: string;
  stamina: string;
  rating: number;
  matchesPlayed: number;
  primaryMetric: number; // e.g. Goals, Yards, Kills
  secondaryMetric: number; // e.g. Assists, Tackles, Wickets
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  number: number;
  position: string;
  roleDescription: string;
  isCaptain?: boolean;
  avatarRingColor: string;
  stats: PlayerStats;
  avatarInitials: string;
}

export interface Club {
  id: string;
  tenantId: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  established: number;
  primaryColor: string;
  secondaryColor: string;
  venueName: string;
  venueCapacity: number;
  venueCoords: { lat: number; lng: number };
  defenseCohesion: number;
  attackPower: number;
  teamworkScore: number;
  repulsionSpeed: number;
  recentForm: ('W' | 'D' | 'L')[];
  formBarHeights: number[]; // e.g. [70, 85, 45, 95, 60]
  managerName: string;
  fanCount: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  period: number;
  clubId: string;
  playerId?: string;
  playerName?: string;
  type: string; // Matches a ScoringRule id
  label: string;
  points: number;
  timestamp: string;
  isCompensated?: boolean;
  compensationNote?: string;
}

export interface Match {
  id: string;
  tenantId: string;
  sportId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'upcoming' | 'completed' | 'postponed';
  scheduledTime: string; // e.g. "8 JUNE, 12:00PM"
  kickoffDate: string; // ISO date for grouping
  venue: string;
  currentPeriod: number;
  currentClock: string; // e.g. "64:20"
  pinnedProductId?: string;
  events: MatchEvent[];
  spectators?: string;
}

export interface StandingsRow {
  rank: number;
  previousRank: number;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  points: number;
  qualification: 'clinched' | 'eliminated' | 'possible';
}

export interface StoreProduct {
  id: string;
  clubId: string;
  title: string;
  category: 'Jerseys' | 'Headwear' | 'Equipment' | 'Collectibles';
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  variants: {
    sizes: string[];
    colors: string[];
  };
  badge?: string;
  bgTint: string;
  isHeroMatchItem?: boolean;
}

export interface CartItem {
  product: StoreProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderReceipt {
  orderId: string;
  timestamp: string;
  tenantName: string;
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  hmacSignature: string;
  customerRole: string;
}

export interface OfflineAction {
  id: string;
  actionType: 'SCORE_MATCH' | 'ROSTER_ADD' | 'ROSTER_TRANSFER' | 'ROSTER_RELEASE' | 'ORDER_CHECKOUT';
  payload: any;
  queuedAt: string;
  status: 'pending' | 'synced' | 'failed';
  resultDescription: string;
}
