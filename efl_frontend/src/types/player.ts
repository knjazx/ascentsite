export interface PlayerStats {
  id: string;
  nickname: string;
  team: string;
  maps: number;
  rounds: number;
  /** Admin enters raw kills/deaths — K/D and K-D Diff are always derived, never stored directly. */
  kills: number;
  deaths: number;
  ratingAscent?: number;
  ratingEfl?: number;
}

export interface PlayerMatchHistory {
  id: string;
  opponent: string;
  opponentSlug?: string;
  date: string;
  event: string;
  map: string;
  result: 'W' | 'L' | 'D';
  score: string;
  kills: number;
  deaths: number;
  assists?: number;
  adr: number;
  rating: number;
  isMvp?: boolean;
}

export interface PlayerGearSettings {
  mouse?: string;
  mousepad?: string;
  dpi?: number;
  sensitivity?: number;
  eDpi?: number;
  hz?: number;
  zoomSensitivity?: number;
  crosshairCode?: string;
  resolution?: string;
  aspectRatio?: string;
  scalingMode?: string;
  keyboard?: string;
  headset?: string;
  monitor?: string;
  launchOptions?: string;
}

export interface PlayerWeaponStat {
  weapon: string;
  kills: number;
  percentage: number;
  headshotPct: number;
}

export interface PlayerMapStat {
  mapName: string;
  winRate: number;
  matchesPlayed: number;
  kd: number;
  rating: number;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  event: string;
  date: string;
  type: 'gold' | 'silver' | 'bronze' | 'mvp' | 'badge';
  description?: string;
}

export interface PlayerCareerTeam {
  teamName: string;
  teamSlug?: string;
  period: string;
  role: string;
}

export interface PlayerProfile extends PlayerStats {
  slug: string;
  realName?: string;
  age?: number;
  avatar?: string;
  role?: string;
  country?: string;
  isSteamVerified?: boolean;
  steamId?: string;
  tradeUrl?: string;
  faceitElo?: number;
  faceitLevel?: number;
  telegramUrl?: string;
  favoriteWeapon?: string;
  favoriteMap?: string;
  playerStatus?: string;
  ratingAscent?: number;
  ratingEfl?: number;
  adr?: number;
  kastPct?: number;
  headshotPct?: number;
  impactRating?: number;
  clutchSuccessPct?: number;
  steamUrl?: string;
  faceitUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  discordHandle?: string;
  bio?: string;
  achievements?: PlayerAchievement[];
  recentMatches?: PlayerMatchHistory[];
  gear?: PlayerGearSettings;
  topWeapons?: PlayerWeaponStat[];
  mapStats?: PlayerMapStat[];
  careerHistory?: PlayerCareerTeam[];
}

export type SortKey = 'maps' | 'rounds' | 'kdDiff' | 'kd' | 'rating' | 'adr' | 'hs';
export type SortDirection = 'asc' | 'desc';

export function getKD(player: PlayerStats): number {
  if (player.deaths === 0) return player.kills;
  return player.kills / player.deaths;
}

export function getKDDiff(player: PlayerStats): number {
  return player.kills - player.deaths;
}

export function getPlayerRating(player: PlayerStats): number {
  if (player.ratingAscent !== undefined && typeof player.ratingAscent === 'number') {
    return player.ratingAscent;
  }
  if (player.ratingEfl !== undefined && typeof player.ratingEfl === 'number') {
    return player.ratingEfl;
  }
  const kd = getKD(player);
  return Number((0.85 + (kd - 1.0) * 0.45).toFixed(2));
}

export type RatingTier = 'red' | 'gray' | 'green' | 'gold';

/**
 * ASCENT Rating tier classification:
 * - 0.00 - 0.89: Red
 * - 0.90 - 1.29: Gray
 * - 1.30 - 1.79: Green
 * - 1.80+: Gold / Yellow
 */
export function getRatingTier(rating: number): RatingTier {
  if (rating < 0.90) return 'red';
  if (rating <= 1.29) return 'gray';
  if (rating <= 1.79) return 'green';
  return 'gold';
}

