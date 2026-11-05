export type MatchStatus = 'live' | 'upcoming' | 'completed';

export interface MatchItem {
  id: string;
  tournamentName: string;
  tournamentSlug: string;
  stage: string;
  teamA: string;
  teamB: string;
  status: MatchStatus;
  date: string;
  time?: string;
  scoreA?: number;
  scoreB?: number;
}
