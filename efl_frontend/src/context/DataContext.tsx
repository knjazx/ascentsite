import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── Re-export existing types ──────────────────────────────────────────────
import type { TeamSummary } from '@/types';
import type { TournamentSummary, TournamentDetail } from '@/types';
import type { PlayerStats, PlayerProfile } from '@/types';
import type { MatchItem } from '@/types';
import type { NewsArticle } from '@/types';
import type { RuleSection } from '@/types';
import type { TeamRegistrationValues } from '@/types';
import type { UserAccount } from '@/types';
import type { MarketOffer, MarketOrder, MarketTransaction } from '@/types';
import { getOfferFinalPrice } from '@/types';
import type { ChangelogItem } from '../data/mocks/rulesChangelogData';

// ── Mock data imports ─────────────────────────────────────────────────────
import { teams as teamsData } from '../data/mocks/teamsMockData';
import { tournaments as tournamentsData, tournamentDetails as tournamentDetailsData } from '../data/mocks/tournamentsMockData';
import { players as playersData } from '../data/mocks/playersMockData';
import { matches as matchesData } from '../data/mocks/matchesMockData';
import { newsArticles as newsData } from '../data/mocks/newsMockData';
import { ruleSections as rulesData } from '../data/mocks/rulesData';
import {
  initialMarketOffers,
  initialMarketOrders,
  initialMarketHistory,
  DEFAULT_MARKET_BALANCE,
} from '../data/mocks/marketMockData';

// ── Team approval model ───────────────────────────────────────────────────
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TeamApproval {
  id: string;
  status: ApprovalStatus;
  submittedAt: string;
  data: TeamRegistrationValues;
}

// ── Season model ───────────────────────────────────────────────────────────
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

const defaultSeasons: Season[] = [
  { id: 'season-one', name: 'Season One', startDate: 'May 12, 2025', endDate: 'Aug 24, 2025', isCurrent: true },
];

// ── League settings ───────────────────────────────────────────────────────
export interface LeagueSettings {
  leagueName: string;
  currentSeason: string;
  discordUrl: string;
  telegramUrl: string;
  twitchUrl: string;
  tiktokUrl: string;
  rulebookUrl?: string;
  rulebookEdition?: string;
  rulebookStatus?: string;
  rulebookBadge?: string;
}

const defaultSettings: LeagueSettings = {
  leagueName: 'ASCENT CS2 League',
  currentSeason: 'Season One',
  discordUrl: 'https://discord.gg/pzdeyZJQzG',
  telegramUrl: 'https://t.me/eflcs3',
  twitchUrl: 'https://www.twitch.tv/eflcs',
  tiktokUrl: 'https://www.tiktok.com/@eflcs1',
  rulebookUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
  rulebookEdition: '2026 Update #2 (v2.4)',
  rulebookStatus: 'Действующая',
  rulebookBadge: 'Официальный регламент',
};

// ── Storage helpers ───────────────────────────────────────────────────────
const STORAGE_PREFIX = 'ascent_v2_';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

// ── Default Demo User ─────────────────────────────────────────────────────
export const defaultDemoUser: UserAccount = {
  id: 'u-captain-1',
  email: 'captain@phoenix.gg',
  nickname: 'BlazeMaster',
  realName: 'Alexander Vance',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
  role: 'captain',
  teamSlug: 'phoenix-rising',
  teamName: 'Phoenix Rising',
  country: 'ru',
  gameRole: 'Капитан / IGL',
  playerStatus: 'active',
  isSteamVerified: true,
  steamId: '76561198299104812',
  steamUrl: 'https://steamcommunity.com/id/blazemaster',
  tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=338839084&token=A8bX2c9',
  faceitUrl: 'https://faceit.com/en/players/blazemaster',
  faceitElo: 2450,
  faceitLevel: 10,
  twitchUrl: 'https://twitch.tv/blazemaster_cs',
  twitterUrl: 'https://x.com/blazemaster',
  discordTag: 'blazemaster#1337',
  telegramUrl: 'https://t.me/blazemaster_cs',
  crosshairCode: 'CSGO-7O2X8-VwE2k-9k8eF-3QvK9-O28aC',
  dpi: 800,
  sensitivity: 1.15,
  zoomSensitivity: 1.0,
  hz: 1000,
  resolution: '1280x960',
  aspectRatio: '4:3',
  scalingMode: 'Stretched',
  launchOptions: '-novid -tickrate 128 -freq 360 +fps_max 0',
  mouse: 'Logitech G Pro X Superlight 2',
  mousepad: 'Artisan Hayate Otsu FX Soft XL',
  keyboard: 'Wooting 60HE (Rapid Trigger)',
  headset: 'HyperX Cloud II Wireless',
  monitor: 'ZOWIE XL2566K (360Hz DyAc+)',
  favoriteWeapon: 'AK-47',
  favoriteMap: 'Mirage',
  ratingEfl: 1.34,
  age: 22,
  bio: 'Капитан и энтри-фраггер команды Phoenix Rising. Участник первого сезона лиги ASCENT CS2.',
};

// ── Fallback Tournament Detail Builder ─────────────────────────────────────
export function createDefaultTournamentDetail(summary: TournamentSummary): TournamentDetail {
  return {
    ...summary,
    tagline: `Official ${summary.type} of ASCENT League — ${summary.season}.`,
    description: [
      `${summary.name} brings together top European CS2 squads competing for championship honors.`,
      `Featuring a ${summary.format} format designed for peak competitive balance.`,
    ],
    badges: [`${summary.teams} Teams`, summary.format, summary.season, summary.statusLabel],
    prizePool: summary.status === 'ongoing' ? '$50,000' : summary.type.includes('Open') ? '$15,000' : '$10,000',
    organizer: 'ASCENT CS2 League',
    game: 'Counter-Strike 2',
    region: 'Europe',
    matchFormat: 'BO3 (Playoffs) / BO1 (Groups)',
    server: 'ASCENT Dedicated Cluster (Frankfurt / Stockholm)',
    anticheat: 'VAC Live + ASCENT Security',
    groups: ['Group A', 'Group B', 'Group C', 'Group D'],
    stageProgress: [
      { label: 'Qualifiers & Seeding', dateRange: summary.dateRange.split('–')[0]?.trim() || 'Start', status: summary.status === 'upcoming' ? 'in-progress' : 'completed' },
      { label: 'Championship Stage', dateRange: summary.dateRange, status: summary.status === 'ongoing' ? 'in-progress' : summary.status === 'completed' ? 'completed' : 'upcoming' },
    ],
    participatingTeams: [
      { name: 'Spirit' },
      { name: 'Falcons' },
      { name: 'Vitality' },
      { name: 'Natus Vincere' },
      { name: 'MOUZ' },
      { name: 'G2' },
      { name: 'FURIA' },
      { name: '9z' },
    ],
    schedule: [
      { id: `sch-${summary.slug}-1`, stage: 'Opening Round', teamA: 'Spirit', teamB: 'Falcons', date: 'Upcoming', time: '18:00 UTC' },
      { id: `sch-${summary.slug}-2`, stage: 'Opening Round', teamA: 'Vitality', teamB: 'Natus Vincere', date: 'Upcoming', time: '20:30 UTC' },
    ],
    results: [
      { id: `res-${summary.slug}-1`, stage: 'Previous Match', teamA: 'Spirit', teamB: 'MOUZ', scoreA: 13, scoreB: 9, date: 'Recent' },
    ],
    standings: [
      {
        group: 'Group A',
        rows: [
          { team: 'Spirit', wins: 2, losses: 0, mapsWon: 26, mapsLost: 14, points: 6 },
          { team: 'Falcons', wins: 1, losses: 1, mapsWon: 20, mapsLost: 19, points: 3 },
          { team: 'Vitality', wins: 1, losses: 1, mapsWon: 18, mapsLost: 20, points: 3 },
          { team: 'Natus Vincere', wins: 0, losses: 2, mapsWon: 15, mapsLost: 26, points: 0 },
        ],
      },
    ],
    rules: [
      {
        title: 'Tournament Regulations',
        content: [
          'All teams must follow the official ASCENT rulebook and compete with verified rosters.',
          'Match disputes and demo inquiries must be submitted to league referees within 15 minutes of match completion.',
        ],
      },
    ],
  };
}

// ── Sample approvals for demo ─────────────────────────────────────────────
const sampleApprovals: TeamApproval[] = [
  {
    id: 'ta1',
    status: 'pending',
    submittedAt: 'Aug 7, 2026',
    data: {
      teamName: 'Phoenix Rising',
      teamTag: 'PHX',
      discordLink: 'https://discord.gg/phoenix',
      contactEmail: 'captain@phoenix.gg',
      captainNickname: 'BlazeMaster',
      captainSteamUrl: 'https://steamcommunity.com/id/blazemaster',
      mainRoster: [
        { id: '1', nickname: 'BlazeMaster', steamUrl: 'https://steamcommunity.com/id/blazemaster' },
        { id: '2', nickname: 'FrostByte', steamUrl: 'https://steamcommunity.com/id/frostbyte' },
        { id: '3', nickname: 'ShadowX', steamUrl: 'https://steamcommunity.com/id/shadowx' },
        { id: '4', nickname: 'VoltStrike', steamUrl: 'https://steamcommunity.com/id/voltstrike' },
        { id: '5', nickname: 'IronClad', steamUrl: 'https://steamcommunity.com/id/ironclad' },
      ],
      substitutes: [{ id: '6', nickname: 'TempPlayer', steamUrl: 'https://steamcommunity.com/id/tempplayer' }],
      logo: null,
    },
  },
  {
    id: 'ta2',
    status: 'pending',
    submittedAt: 'Aug 8, 2026',
    data: {
      teamName: 'Arctic Wolves',
      teamTag: 'AWF',
      discordLink: 'https://discord.gg/arcticwolves',
      contactEmail: 'info@arcticwolves.gg',
      captainNickname: 'WolfAlpha',
      captainSteamUrl: 'https://steamcommunity.com/id/wolfalpha',
      mainRoster: [
        { id: '1', nickname: 'WolfAlpha', steamUrl: 'https://steamcommunity.com/id/wolfalpha' },
        { id: '2', nickname: 'IceHunter', steamUrl: 'https://steamcommunity.com/id/icehunter' },
        { id: '3', nickname: 'SnowDrift', steamUrl: 'https://steamcommunity.com/id/snowdrift' },
        { id: '4', nickname: 'FrozenGun', steamUrl: 'https://steamcommunity.com/id/frozengun' },
        { id: '5', nickname: 'TundraKing', steamUrl: 'https://steamcommunity.com/id/tundraking' },
      ],
      substitutes: [],
      logo: null,
    },
  },
];

// ── Context shape ─────────────────────────────────────────────────────────
interface DataContextValue {
  tournaments: TournamentSummary[];
  tournamentDetails: Record<string, TournamentDetail>;
  teams: TeamSummary[];
  players: (PlayerStats | PlayerProfile)[];
  matches: MatchItem[];
  news: NewsArticle[];
  rules: RuleSection[];
  changelog: ChangelogItem[];
  teamApprovals: TeamApproval[];
  seasons: Season[];
  settings: LeagueSettings;

  // User Auth & Profile
  currentUser: UserAccount | null;
  loginUser: (email: string, nickname?: string, role?: 'player' | 'captain' | 'admin') => UserAccount;
  loginWithSteam: (steamData: {
    nickname: string;
    steamId: string;
    avatar?: string;
    realName?: string;
    country?: string;
    teamName?: string;
    teamSlug?: string;
    role?: 'player' | 'captain' | 'admin';
    gameRole?: string;
    playerStatus?: 'active' | 'lft' | 'reserve';
  }) => UserAccount;
  logoutUser: () => void;
  updateUserProfile: (patch: Partial<UserAccount>) => void;

  // Tournaments CRUD
  addTournament: (t: TournamentSummary) => void;
  updateTournament: (slug: string, t: Partial<TournamentSummary>) => void;
  deleteTournament: (slug: string) => void;
  updateTournamentDetail: (slug: string, patch: Partial<TournamentDetail>) => void;

  // Teams CRUD
  addTeam: (t: TeamSummary) => void;
  updateTeam: (slug: string, t: Partial<TeamSummary>) => void;
  deleteTeam: (slug: string) => void;

  // Players CRUD
  addPlayer: (p: PlayerStats | PlayerProfile) => void;
  updatePlayer: (id: string, p: Partial<PlayerProfile>) => void;
  deletePlayer: (id: string) => void;

  // Matches CRUD
  addMatch: (m: MatchItem) => void;
  updateMatch: (id: string, m: Partial<MatchItem>) => void;
  deleteMatch: (id: string) => void;

  // News CRUD
  addNewsArticle: (a: NewsArticle) => void;
  updateNewsArticle: (slug: string, a: Partial<NewsArticle>) => void;
  deleteNewsArticle: (slug: string) => void;

  // Rules CRUD
  addRuleSection: (s: RuleSection) => void;
  updateRuleSection: (id: string, s: Partial<RuleSection>) => void;
  deleteRuleSection: (id: string) => void;

  // Changelog CRUD
  addChangelogItem: (item: ChangelogItem) => void;
  updateChangelogItem: (id: string, patch: Partial<ChangelogItem>) => void;
  deleteChangelogItem: (id: string) => void;

  // Team Approvals
  submitTeamApproval: (data: TeamRegistrationValues) => void;
  approveTeam: (id: string) => void;
  rejectTeam: (id: string) => void;

  // Seasons CRUD
  addSeason: (s: Season) => void;
  updateSeason: (id: string, s: Partial<Season>) => void;
  deleteSeason: (id: string) => void;
  setCurrentSeason: (id: string) => void;

  // Settings
  updateSettings: (patch: Partial<LeagueSettings>) => void;

  // Global Player Wallet Modal
  isWalletOpen: boolean;
  openWallet: () => void;
  closeWallet: () => void;

  // Market
  marketOffers: MarketOffer[];
  marketOrders: MarketOrder[];
  marketHistory: MarketTransaction[];
  marketBalance: number;
  marketCart: string[];
  addToCart: (offerId: string) => boolean;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  checkoutMarket: (tradeUrl?: string) => { success: boolean; message: string; count?: number; total?: number };
  confirmOrderDone: (orderId: string) => void;
  addMarketOffer: (offer: MarketOffer) => void;
  updateMarketOffer: (id: string, patch: Partial<MarketOffer>) => void;
  deleteMarketOffer: (id: string) => void;
  setMarketBalance: (balance: number) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>(() =>
    loadStored('tournaments', [...tournamentsData])
  );
  const [tournamentDetails, setTournamentDetails] = useState<Record<string, TournamentDetail>>(() =>
    loadStored('tournamentDetails', { ...tournamentDetailsData })
  );
  const [teams, setTeams] = useState<TeamSummary[]>(() =>
    loadStored('teams', [...teamsData])
  );
  const [players, setPlayers] = useState<(PlayerStats | PlayerProfile)[]>(() => {
    const stored = loadStored<(PlayerStats | PlayerProfile)[]>('players', []);
    if (!stored || stored.length === 0) {
      return [...playersData];
    }

    // Index stored players by id and nickname (lowercase)
    const storedById = new Map<string, PlayerStats | PlayerProfile>();
    const storedByNick = new Map<string, PlayerStats | PlayerProfile>();
    for (const p of stored) {
      if (p.id) storedById.set(p.id.toLowerCase(), p);
      if (p.nickname) storedByNick.set(p.nickname.toLowerCase(), p);
    }

    const mergedList: (PlayerStats | PlayerProfile)[] = [];
    const usedStoredIds = new Set<string>();

    for (const def of playersData) {
      const match = storedById.get(def.id.toLowerCase()) || storedByNick.get(def.nickname.toLowerCase());
      if (match) {
        usedStoredIds.add(match.id.toLowerCase());
        const rating = match.ratingAscent ?? match.ratingEfl ?? def.ratingAscent ?? def.ratingEfl;
        mergedList.push({
          ...def,
          ...match,
          ratingAscent: rating,
          ratingEfl: rating,
        });
      } else {
        mergedList.push(def);
      }
    }

    // Also preserve any custom players created by admin that are not in default playersData
    for (const p of stored) {
      if (!usedStoredIds.has(p.id.toLowerCase())) {
        const rating = p.ratingAscent ?? p.ratingEfl;
        mergedList.push({
          ...p,
          ratingAscent: rating,
          ratingEfl: rating,
        });
      }
    }

    return mergedList;
  });
  const [matches, setMatches] = useState<MatchItem[]>(() =>
    loadStored('matches', [...matchesData])
  );
  const [news, setNews] = useState<NewsArticle[]>(() =>
    loadStored('news', [...newsData])
  );
  const [rules, setRules] = useState<RuleSection[]>(() =>
    loadStored('rules', [...rulesData])
  );
  const [changelog, setChangelog] = useState<ChangelogItem[]>(() => {
    const stored = loadStored<ChangelogItem[]>('changelog', []);
    // Ensure all test mock items are removed
    return stored.filter((item) => !item.id.startsWith('ch-') && !item.id.startsWith('test-'));
  });
  const [teamApprovals, setTeamApprovals] = useState<TeamApproval[]>(() =>
    loadStored('teamApprovals', [...sampleApprovals])
  );
  const [seasons, setSeasons] = useState<Season[]>(() =>
    loadStored('seasons', [...defaultSeasons])
  );
  const [settings, setSettings] = useState<LeagueSettings>(() => {
    const stored = loadStored<Partial<LeagueSettings>>('settings', {});
    return { ...defaultSettings, ...stored };
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('guest=1')) {
      return null;
    }
    return loadStored('currentUser', defaultDemoUser);
  });

  // ── Global Wallet State ──────────────────────────────────────────────────
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const openWallet = useCallback(() => setIsWalletOpen(true), []);
  const closeWallet = useCallback(() => setIsWalletOpen(false), []);

  // ── Market States ────────────────────────────────────────────────────────
  const [marketOffers, setMarketOffers] = useState<MarketOffer[]>(() =>
    loadStored('market_offers', [...initialMarketOffers])
  );
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(() =>
    loadStored('market_orders', [...initialMarketOrders])
  );
  const [marketHistory, setMarketHistory] = useState<MarketTransaction[]>(() =>
    loadStored('market_history', [...initialMarketHistory])
  );
  const [marketBalance, setMarketBalanceState] = useState<number>(() =>
    loadStored('market_balance', DEFAULT_MARKET_BALANCE)
  );
  const [marketCart, setMarketCart] = useState<string[]>(() =>
    loadStored('market_cart', [])
  );

  // Synchronize to localStorage
  useEffect(() => saveStored('tournaments', tournaments), [tournaments]);
  useEffect(() => saveStored('tournamentDetails', tournamentDetails), [tournamentDetails]);
  useEffect(() => saveStored('teams', teams), [teams]);
  useEffect(() => saveStored('players', players), [players]);
  useEffect(() => saveStored('matches', matches), [matches]);
  useEffect(() => saveStored('news', news), [news]);
  useEffect(() => saveStored('rules', rules), [rules]);
  useEffect(() => saveStored('changelog', changelog), [changelog]);
  useEffect(() => saveStored('teamApprovals', teamApprovals), [teamApprovals]);
  useEffect(() => saveStored('seasons', seasons), [seasons]);
  useEffect(() => saveStored('settings', settings), [settings]);
  useEffect(() => saveStored('currentUser', currentUser), [currentUser]);

  useEffect(() => saveStored('market_offers', marketOffers), [marketOffers]);
  useEffect(() => saveStored('market_orders', marketOrders), [marketOrders]);
  useEffect(() => saveStored('market_history', marketHistory), [marketHistory]);
  useEffect(() => saveStored('market_balance', marketBalance), [marketBalance]);
  useEffect(() => saveStored('market_cart', marketCart), [marketCart]);

  // Synchronize across open browser tabs via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === `${STORAGE_PREFIX}market_orders` && e.newValue) {
        try {
          setMarketOrders(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_PREFIX}market_offers` && e.newValue) {
        try {
          setMarketOffers(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_PREFIX}market_balance` && e.newValue) {
        try {
          setMarketBalanceState(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_PREFIX}market_history` && e.newValue) {
        try {
          setMarketHistory(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_PREFIX}teamApprovals` && e.newValue) {
        try {
          setTeamApprovals(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── User Auth ────────────────────────────────────────────────────────────
  const loginUser = useCallback((email: string, nickname?: string, role: 'player' | 'captain' | 'admin' = 'captain') => {
    const rawNick = nickname || email.split('@')[0];
    const user: UserAccount = {
      id: `u-${Date.now()}`,
      email,
      nickname: rawNick,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rawNick}&backgroundColor=111111`,
      role,
      teamName: role === 'captain' ? 'Phoenix Rising' : 'Spirit',
      teamSlug: role === 'captain' ? 'phoenix-rising' : 'spirit',
      country: 'ru',
      gameRole: 'Стар Рифлер',
      playerStatus: 'active',
      isSteamVerified: true,
      steamId: '76561198' + Math.floor(100000000 + Math.random() * 900000000),
      steamUrl: `https://steamcommunity.com/id/${rawNick.toLowerCase()}`,
      tradeUrl: `https://steamcommunity.com/tradeoffer/new/?partner=338839084&token=AscentCS2`,
      faceitUrl: `https://faceit.com/en/players/${rawNick.toLowerCase()}`,
      faceitElo: 2150,
      faceitLevel: 10,
      crosshairCode: 'CSGO-7O2X8-VwE2k-9k8eF-3QvK9-O28aC',
      dpi: 800,
      sensitivity: 1.15,
      zoomSensitivity: 1.0,
      hz: 1000,
      resolution: '1280x960',
      aspectRatio: '4:3',
      scalingMode: 'Stretched',
      launchOptions: '-novid -tickrate 128 -freq 360 +fps_max 0',
      mouse: 'Logitech G Pro X Superlight 2',
      mousepad: 'Artisan Hayate Otsu FX Soft XL',
      keyboard: 'Wooting 60HE',
      headset: 'HyperX Cloud II',
      monitor: 'ZOWIE XL2566K',
      favoriteWeapon: 'AK-47',
      favoriteMap: 'Mirage',
      ratingEfl: 1.25,
      age: 21,
      bio: `Официальный участник лиги ASCENT CS2.`,
    };
    setCurrentUser(user);
    return user;
  }, []);

  const loginWithSteam = useCallback((steamData: {
    nickname: string;
    steamId: string;
    avatar?: string;
    realName?: string;
    country?: string;
    teamName?: string;
    teamSlug?: string;
    role?: 'player' | 'captain' | 'admin';
    gameRole?: string;
    playerStatus?: 'active' | 'lft' | 'reserve';
  }) => {
    const user: UserAccount = {
      id: `steam-${steamData.steamId}`,
      email: `${steamData.nickname.toLowerCase()}@steam.ascent.gg`,
      nickname: steamData.nickname,
      realName: steamData.realName || steamData.nickname,
      avatar: steamData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${steamData.nickname}&backgroundColor=111111`,
      role: steamData.role || 'player',
      teamName: steamData.teamName || 'Свободный агент (LFT)',
      teamSlug: steamData.teamSlug || '',
      country: steamData.country || 'ru',
      gameRole: steamData.gameRole || 'Стар Рифлер',
      playerStatus: steamData.playerStatus || (steamData.teamName ? 'active' : 'lft'),
      isSteamVerified: true,
      steamId: steamData.steamId,
      steamUrl: `https://steamcommunity.com/profiles/${steamData.steamId}`,
      tradeUrl: `https://steamcommunity.com/tradeoffer/new/?partner=${steamData.steamId.slice(-8)}&token=AscentCS2`,
      faceitUrl: `https://faceit.com/en/players/${steamData.nickname.toLowerCase()}`,
      faceitElo: 2320,
      faceitLevel: 10,
      crosshairCode: 'CSGO-7O2X8-VwE2k-9k8eF-3QvK9-O28aC',
      dpi: 800,
      sensitivity: 1.15,
      zoomSensitivity: 1.0,
      hz: 1000,
      resolution: '1280x960',
      aspectRatio: '4:3',
      scalingMode: 'Stretched',
      launchOptions: '-novid -tickrate 128 -freq 360 +fps_max 0',
      mouse: 'Logitech G Pro X Superlight 2',
      mousepad: 'Artisan Hayate Otsu FX Soft XL',
      keyboard: 'Wooting 60HE (Rapid Trigger)',
      headset: 'HyperX Cloud II Wireless',
      monitor: 'ZOWIE XL2566K (360Hz)',
      favoriteWeapon: 'AK-47',
      favoriteMap: 'Mirage',
      ratingEfl: 1.28,
      age: 20,
      bio: `Верифицированный аккаунт Steam OpenID (SteamID: ${steamData.steamId}). Выступает в турнирах ASCENT CS2 League.`,
    };
    setCurrentUser(user);
    return user;
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateUserProfile = useCallback((patch: Partial<UserAccount>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  // ── Tournaments ─────────────────────────────────────────────────────────
  const addTournament = useCallback((t: TournamentSummary) => {
    setTournaments((prev) => [...prev, t]);
    setTournamentDetails((prev) => {
      if (!prev[t.slug]) {
        return { ...prev, [t.slug]: createDefaultTournamentDetail(t) };
      }
      return prev;
    });
  }, []);

  const updateTournament = useCallback((slug: string, patch: Partial<TournamentSummary>) => {
    setTournaments((prev) => prev.map((t) => (t.slug === slug ? { ...t, ...patch } : t)));
    setTournamentDetails((prev) => {
      if (prev[slug]) {
        return { ...prev, [slug]: { ...prev[slug], ...patch } };
      }
      return prev;
    });
  }, []);

  const deleteTournament = useCallback((slug: string) => {
    setTournaments((prev) => prev.filter((t) => t.slug !== slug));
    setTournamentDetails((prev) => {
      if (!(slug in prev)) return prev;
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }, []);

  const updateTournamentDetail = useCallback((slug: string, patch: Partial<TournamentDetail>) => {
    setTournamentDetails((prev) => {
      const existing = prev[slug] || (tournaments.find(t => t.slug === slug) ? createDefaultTournamentDetail(tournaments.find(t => t.slug === slug)!) : {} as TournamentDetail);
      return {
        ...prev,
        [slug]: { ...existing, ...patch },
      };
    });
  }, [tournaments]);

  // ── Teams ───────────────────────────────────────────────────────────────
  const addTeam = useCallback((t: TeamSummary) => {
    setTeams((prev) => [...prev, t]);
  }, []);

  const updateTeam = useCallback((slug: string, patch: Partial<TeamSummary>) => {
    setTeams((prev) => prev.map((t) => (t.slug === slug ? { ...t, ...patch } : t)));
  }, []);

  const deleteTeam = useCallback((slug: string) => {
    setTeams((prev) => prev.filter((t) => t.slug !== slug));
  }, []);

  // ── Players ─────────────────────────────────────────────────────────────
  const addPlayer = useCallback((p: PlayerStats | PlayerProfile) => {
    const rating = p.ratingAscent ?? p.ratingEfl ?? 1.05;
    setPlayers((prev) => [
      ...prev,
      {
        ...p,
        ratingAscent: rating,
        ratingEfl: rating,
      },
    ]);
  }, []);

  const updatePlayer = useCallback((id: string, patch: Partial<PlayerProfile>) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const rating = patch.ratingAscent ?? patch.ratingEfl ?? p.ratingAscent ?? p.ratingEfl;
          return {
            ...p,
            ...patch,
            ratingAscent: rating,
            ratingEfl: rating,
          };
        }
        return p;
      })
    );
  }, []);

  const deletePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Matches ─────────────────────────────────────────────────────────────
  const addMatch = useCallback((m: MatchItem) => {
    setMatches((prev) => [...prev, m]);
  }, []);

  const updateMatch = useCallback((id: string, patch: Partial<MatchItem>) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteMatch = useCallback((id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── News ────────────────────────────────────────────────────────────────
  const addNewsArticle = useCallback((a: NewsArticle) => {
    setNews((prev) => [...prev, a]);
  }, []);

  const updateNewsArticle = useCallback((slug: string, patch: Partial<NewsArticle>) => {
    setNews((prev) => prev.map((a) => (a.slug === slug ? { ...a, ...patch } : a)));
  }, []);

  const deleteNewsArticle = useCallback((slug: string) => {
    setNews((prev) => prev.filter((a) => a.slug !== slug));
  }, []);

  // ── Rules ───────────────────────────────────────────────────────────────
  const addRuleSection = useCallback((s: RuleSection) => {
    setRules((prev) => [...prev, s]);
  }, []);

  const updateRuleSection = useCallback((id: string, patch: Partial<RuleSection>) => {
    setRules((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteRuleSection = useCallback((id: string) => {
    setRules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Changelog ───────────────────────────────────────────────────────────
  const addChangelogItem = useCallback((item: ChangelogItem) => {
    setChangelog((prev) => [item, ...prev]);
  }, []);

  const updateChangelogItem = useCallback((id: string, patch: Partial<ChangelogItem>) => {
    setChangelog((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const deleteChangelogItem = useCallback((id: string) => {
    setChangelog((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ── Team Approvals ──────────────────────────────────────────────────────
  const submitTeamApproval = useCallback((data: TeamRegistrationValues) => {
    const approval: TeamApproval = {
      id: `ta-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data,
    };
    setTeamApprovals((prev) => [approval, ...prev]);
  }, []);

  const approveTeam = useCallback((id: string) => {
    setTeamApprovals((prev) => {
      const approval = prev.find((a) => a.id === id);
      if (approval) {
        const teamName = approval.data.teamName;
        const teamSlug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const captainNick = approval.data.captainNickname;

        // Build complete roster including captain if captain is specified
        const rosterNicks = approval.data.mainRoster.map(p => p.nickname).filter(Boolean);
        if (captainNick && !rosterNicks.includes(captainNick)) {
          rosterNicks.unshift(captainNick);
        }

        const newTeam: TeamSummary = {
          slug: teamSlug,
          name: teamName,
          tier: 'T3',
          rating: 1200,
          founded: new Date().toLocaleDateString('en-US', { year: 'numeric' }),
          coach: captainNick ? `${captainNick} (Captain)` : 'Team Staff',
          bio: `${teamName} is an officially registered competitor in the ASCENT League.`,
          discordUrl: approval.data.discordLink || undefined,
          roster: rosterNicks.map((nick, index) => ({
            nickname: nick,
            image: `https://api.dicebear.com/7.x/bottts/svg?seed=${nick}&backgroundColor=111111`,
            isCaptain: index === 0 || nick === captainNick,
            isSniper: index === 1,
          })),
        };

        setTeams((currentTeams) => {
          if (currentTeams.some(t => t.slug === teamSlug)) return currentTeams;
          return [...currentTeams, newTeam];
        });

        // Add roster players and captain to players list
        setPlayers((currentPlayers) => {
          const playersToAdd: PlayerStats[] = rosterNicks
            .filter(nick => !currentPlayers.some(cp => cp.nickname.toLowerCase() === nick.toLowerCase()))
            .map((nick, idx) => ({
              id: `p-${teamSlug}-${idx + 1}`,
              nickname: nick,
              team: teamName,
              maps: 0,
              rounds: 0,
              kills: 0,
              deaths: 0,
            }));
          return [...currentPlayers, ...playersToAdd];
        });
      }
      return prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a));
    });
  }, []);

  const rejectTeam = useCallback((id: string) => {
    setTeamApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)));
  }, []);

  // ── Seasons ─────────────────────────────────────────────────────────────
  const addSeason = useCallback((s: Season) => {
    setSeasons((prev) => [...prev, s]);
  }, []);

  const updateSeason = useCallback((id: string, patch: Partial<Season>) => {
    setSeasons((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSeason = useCallback((id: string) => {
    setSeasons((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const setCurrentSeason = useCallback((id: string) => {
    setSeasons((prev) => prev.map((s) => ({ ...s, isCurrent: s.id === id })));
  }, []);

  // ── Settings ────────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<LeagueSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Market Handlers ─────────────────────────────────────────────────────
  const addToCart = useCallback((offerId: string): boolean => {
    const offer = marketOffers.find((o) => o.id === offerId);
    if (!offer || offer.stock <= 0) return false;

    const currentCount = marketCart.filter((id) => id === offerId).length;
    if (currentCount >= offer.stock) return false;

    setMarketCart((prev) => [...prev, offerId]);
    return true;
  }, [marketOffers, marketCart]);

  const removeFromCart = useCallback((index: number) => {
    setMarketCart((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }, []);

  const clearCart = useCallback(() => {
    setMarketCart([]);
  }, []);

  const setMarketBalance = useCallback((bal: number) => {
    setMarketBalanceState(Math.max(0, bal));
  }, []);

  const checkoutMarket = useCallback((_tradeUrl?: string) => {
    if (marketCart.length === 0) {
      return { success: false, message: 'Корзина пуста' };
    }

    const itemsToBuy: MarketOffer[] = [];
    let totalToPay = 0;

    for (const id of marketCart) {
      const off = marketOffers.find((o) => o.id === id);
      if (off && off.stock > 0) {
        const finalP = getOfferFinalPrice(off);
        totalToPay += finalP;
        itemsToBuy.push(off);
      }
    }

    if (itemsToBuy.length === 0) {
      return { success: false, message: 'Выбранных лотов больше нет в наличии' };
    }

    if (marketBalance < totalToPay) {
      return { success: false, message: 'Недостаточно монет на балансе!' };
    }

    // Deduct balance
    setMarketBalanceState((prev) => prev - totalToPay);

    // Update stocks
    setMarketOffers((prevOffers) =>
      prevOffers.map((off) => {
        const count = itemsToBuy.filter((item) => item.id === off.id).length;
        if (count > 0 && off.stock > 0) {
          return { ...off, stock: Math.max(0, off.stock - count) };
        }
        return off;
      })
    );

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateShort = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    // Add new orders
    const newOrders: MarketOrder[] = itemsToBuy.map((off, idx) => {
      const finalP = getOfferFinalPrice(off);
      const randomId = Math.floor(10000 + Math.random() * 90000);
      return {
        id: `ORD-${randomId}${idx > 0 ? `-${idx}` : ''}`,
        title: off.title,
        price: finalP,
        date: dateFormatted,
        status: 'pending' as const,
        statusLabel: 'В очереди на выдачу',
        buyerNickname: currentUser?.nickname || 'BlazeMaster',
        buyerEmail: currentUser?.email || 'captain@phoenix.gg',
        buyerSteamUrl: currentUser?.steamUrl || '',
      };
    });

    setMarketOrders((prev) => [...newOrders, ...prev]);

    // Add new transactions
    const newTransactions: MarketTransaction[] = itemsToBuy.map((off, idx) => {
      const finalP = getOfferFinalPrice(off);
      return {
        id: `tx-mkt-${Date.now()}-${idx}`,
        date: dateShort,
        type: 'Покупка',
        desc: `Покупка лота: ${off.title}`,
        amount: -finalP,
        status: 'Успешно',
      };
    });

    setMarketHistory((prev) => [...newTransactions, ...prev]);

    // Clear cart
    setMarketCart([]);

    return {
      success: true,
      message: `Заказ успешно оформлен! Списано -${totalToPay.toLocaleString()} AC`,
      count: itemsToBuy.length,
      total: totalToPay,
    };
  }, [marketCart, marketOffers, marketBalance, currentUser]);

  const confirmOrderDone = useCallback((orderId: string) => {
    setMarketOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'done' as const, statusLabel: 'Выдано и подтверждено' }
          : ord
      )
    );
  }, []);

  const addMarketOffer = useCallback((offer: MarketOffer) => {
    setMarketOffers((prev) => [offer, ...prev]);
  }, []);

  const updateMarketOffer = useCallback((id: string, patch: Partial<MarketOffer>) => {
    setMarketOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const deleteMarketOffer = useCallback((id: string) => {
    setMarketOffers((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const value: DataContextValue = {
    tournaments, tournamentDetails, teams, players, matches, news, rules, changelog, teamApprovals, seasons, settings,
    currentUser, loginUser, loginWithSteam, logoutUser, updateUserProfile,
    addTournament, updateTournament, deleteTournament,
    updateTournamentDetail,
    addTeam, updateTeam, deleteTeam,
    addPlayer, updatePlayer, deletePlayer,
    addMatch, updateMatch, deleteMatch,
    addNewsArticle, updateNewsArticle, deleteNewsArticle,
    addRuleSection, updateRuleSection, deleteRuleSection,
    addChangelogItem, updateChangelogItem, deleteChangelogItem,
    submitTeamApproval, approveTeam, rejectTeam,
    addSeason, updateSeason, deleteSeason, setCurrentSeason,
    updateSettings,
    isWalletOpen, openWallet, closeWallet,
    marketOffers, marketOrders, marketHistory, marketBalance, marketCart,
    addToCart, removeFromCart, clearCart, checkoutMarket, confirmOrderDone,
    addMarketOffer, updateMarketOffer, deleteMarketOffer, setMarketBalance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};