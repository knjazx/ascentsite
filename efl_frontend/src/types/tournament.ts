export type TournamentStatus = 'ongoing' | 'upcoming' | 'completed';

export type TournamentIcon = 'trophy' | 'target' | 'shield' | 'chevrons' | 'star';

export interface TournamentSummary {
  slug: string;
  name: string;
  type: string;
  icon: TournamentIcon;
  season: string;
  teams: number;
  dateRange: string;
  format: string;
  status: TournamentStatus;
  statusLabel: string;
}

export interface StageProgressItem {
  label: string;
  dateRange: string;
  status: 'in-progress' | 'upcoming' | 'completed';
}

export interface TournamentTeamRef {
  name: string;
}

export interface ScheduleMatch {
  id: string;
  stage: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
}

export interface ResultMatch {
  id: string;
  stage: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

export interface StandingRow {
  team: string;
  wins: number;
  losses: number;
  mapsWon: number;
  mapsLost: number;
  points: number;
}

export interface StandingGroup {
  group: string;
  rows: StandingRow[];
}

export interface TournamentRuleSection {
  title: string;
  content: string[];
}

export interface TournamentDetail extends TournamentSummary {
  tagline: string;
  description: string[];
  badges: string[];
  prizePool: string;
  organizer: string;
  game: string;
  region: string;
  matchFormat: string;
  server: string;
  anticheat: string;
  groups: string[];
  stageProgress: StageProgressItem[];
  participatingTeams: TournamentTeamRef[];
  schedule: ScheduleMatch[];
  results: ResultMatch[];
  standings: StandingGroup[];
  rules: TournamentRuleSection[];
}
