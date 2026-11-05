export interface InfoCardContent {
  label: string;
  title: string;
  subtitle: string;
}

export const infoCardsData: {
  match: InfoCardContent;
  tournament: InfoCardContent;
  season: InfoCardContent;
} = {
  match: {
    label: 'Upcoming match',
    title: 'Nexus vs ORVIN',
    subtitle: 'Today · 16:00 UTC',
  },
  tournament: {
    label: 'Current tournament',
    title: 'ASCENT Season One',
    subtitle: 'Group Stage',
  },
  season: {
    label: 'Current season',
    title: 'Season One',
    subtitle: 'May – August 2025',
  },
};

export interface MatchResult {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  timeAgo: string;
}

// TODO: замінити на дані з API, коли буде готовий ендпоінт результатів
export const latestResults: MatchResult[] = [
  { id: 'r1', teamA: 'Xtreme Team', teamB: 'Fatum Esports', scoreA: 13, scoreB: 7, timeAgo: '2h ago' },
  { id: 'r2', teamA: 'NPC Junior', teamB: 'Remast Team', scoreA: 13, scoreB: 10, timeAgo: '3h ago' },
  { id: 'r3', teamA: 'Fuji Gaming', teamB: 'ORVIN', scoreA: 13, scoreB: 6, timeAgo: '4h ago' },
  { id: 'r4', teamA: 'HEXORIA', teamB: 'X Team', scoreA: 13, scoreB: 9, timeAgo: '5h ago' },
  { id: 'r5', teamA: '1LOSE Team', teamB: 'Nova Impera', scoreA: 13, scoreB: 11, timeAgo: '6h ago' },
];

export interface UpcomingMatchItem {
  id: string;
  teamA: string;
  teamB: string;
  time: string;
}

// TODO: замінити на дані з API, коли буде готовий ендпоінт розкладу
export const upcomingMatches: UpcomingMatchItem[] = [
  { id: 'u1', teamA: 'Nexus', teamB: 'ORVIN', time: '16:00 UTC' },
  { id: 'u2', teamA: 'Prus Team', teamB: '300 TON', time: '17:30 UTC' },
  { id: 'u3', teamA: 'HEVEN TEAM', teamB: 'NPC', time: '19:00 UTC' },
  { id: 'u4', teamA: 'BLACK WHITE', teamB: 'Apex Predators', time: '20:30 UTC' },
  { id: 'u5', teamA: 'ENGAGE Esports', teamB: 'ZMP Kids', time: '22:00 UTC' },
];
