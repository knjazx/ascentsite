export type TeamTier = 'T1' | 'T2' | 'T3';

export interface TeamPlayer {
  nickname: string;
  realName?: string;
  role?: string;
  rating?: number;
  adr?: number;
  kd?: number;
  image?: string;
  isCaptain?: boolean;
  isSniper?: boolean;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: string;
  roundWinRate?: number;
  pistolWinRate?: number;
  overtimeWinRate?: number;
}

export interface TeamAchievementItem {
  id: string;
  title: string;
  event: string;
  date: string;
  placement: string;
  prize?: string;
  tier?: string;
}

export interface TeamMapStatItem {
  mapName: string;
  winRate: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ctWinRate?: number;
  tWinRate?: number;
  rating?: number;
}

export interface TeamRecentMatchItem {
  id: string;
  opponent: string;
  date: string;
  result: 'W' | 'L';
  score: string;
  event?: string;
  opponentSlug?: string;
  map?: string;
}

export interface TeamSummary {
  slug: string;
  name: string;
  tier: TeamTier;
  /** ASCENT Rating — admin-editable ranking score, same idea as the Valve points reference. */
  rating: number;
  roster: TeamPlayer[];
  founded?: string;
  coach?: string;
  analyst?: string;
  manager?: string;
  worldRank?: number;
  bio?: string;
  twitterUrl?: string;
  discordUrl?: string;
  twitchUrl?: string;
  websiteUrl?: string;
  stats?: TeamStats;
  achievements?: (string | TeamAchievementItem)[];
  mapStats?: TeamMapStatItem[];
  recentMatches?: TeamRecentMatchItem[];
}

export interface TeamDetail extends TeamSummary {
  stats: TeamStats;
  achievements: (string | TeamAchievementItem)[];
  recentMatches: TeamRecentMatchItem[];
}
