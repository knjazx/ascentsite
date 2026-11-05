import type { TeamSummary, TeamDetail, TeamPlayer } from '@/types';

// TODO: замінити на дані з API. Rating/tier — поля, які адмін редагує вручну,
// до появи адмінки лежать тут як моки.
const createMockRoster = (names: string[]): TeamPlayer[] => {
  return names.map((name) => ({
    nickname: name,
    image: '',
    isCaptain: false,
    isSniper: false,
  }));
};

const rawTeams: TeamSummary[] = [
  { slug: 'spirit', name: 'Spirit', tier: 'T1', rating: 2018, roster: createMockRoster(['sh1ro', 'magixx', 'tN1R', 'zont1x', 'donk']) },
  { slug: 'falcons', name: 'Falcons', tier: 'T1', rating: 1982, roster: createMockRoster(['karrigan', 'NiKo', 'TeSeS', 'm0NESY', 'kyousuke']) },
  { slug: 'vitality', name: 'Vitality', tier: 'T1', rating: 1904, roster: createMockRoster(['apEX', 'ropz', 'ZywOo', 'flameZ', 'mezii']) },
  { slug: 'natus-vincere', name: 'Natus Vincere', tier: 'T1', rating: 1841, roster: createMockRoster(['Aleksib', 'iM', 'b1t', 'w0nderful', 'makazze']) },
  { slug: '9z', name: '9z', tier: 'T2', rating: 1840, roster: createMockRoster(['max', 'dgt', 'meyern', 'luchov', 'HUASOPEEK']) },
  { slug: 'furia', name: 'FURIA', tier: 'T2', rating: 1834, roster: createMockRoster(['FalleN', 'yuurih', 'YEKINDAR', 'KSCERATO', 'molodoy']) },
  { slug: 'legacy', name: 'Legacy', tier: 'T2', rating: 1806, roster: createMockRoster(['arT', 'dumau', 'latto', 'n1ssim', 'saadzin']) },
  { slug: 'mouz', name: 'MOUZ', tier: 'T1', rating: 1774, roster: createMockRoster(['torzsi', 'Spinx', 'jL', 'xertioN', 'xelex']) },
  { slug: 'betboom', name: 'BetBoom', tier: 'T1', rating: 1756, roster: createMockRoster(['Boombl4', 'zorte', 'd1Ledez', 'FL4MUS', 'Magnojez']) },
  { slug: 'g2', name: 'G2', tier: 'T1', rating: 1737, roster: createMockRoster(['huNter-', 'NertZ', 'SunPayus', 'HeavyGod', 'MATYS']) },
  { slug: 'aurora', name: 'Aurora', tier: 'T1', rating: 1728, roster: createMockRoster(['MAJ3R', 'XANTARES', 'woxic', 'soulfly', 'Wicadia']) },
  { slug: 'fut', name: 'FUT', tier: 'T1', rating: 1707, roster: createMockRoster(['dem0n', 'lauNX', 'Krabeni', 'cmtry', 'dziugss']) },
  { slug: 'parivision', name: 'PARIVISION', tier: 'T1', rating: 1698, roster: createMockRoster(['HObbit', 'Jame', 'xiELO', 'zweih', 'slaxejezzz']) },
];

export const teams: TeamDetail[] = rawTeams.map(team => ({
  ...team,
  stats: {
    matchesPlayed: 45,
    wins: Math.floor(Math.random() * 20) + 15,
    losses: Math.floor(Math.random() * 10) + 5,
    winRate: 60 + Math.floor(Math.random() * 20),
    streak: Math.random() > 0.5 ? 'W3' : 'L1',
  },
  achievements: [
    'ASCENT Season 1 Champion',
    'Winter Cup Finalist'
  ],
  recentMatches: [
    { id: '1', opponent: 'Navi', date: '2023-10-12', result: 'W', score: '2-0' },
    { id: '2', opponent: 'Faze', date: '2023-10-10', result: 'L', score: '1-2' },
    { id: '3', opponent: 'Vitality', date: '2023-10-05', result: 'W', score: '2-1' },
  ]
}));
