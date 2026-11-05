import type { TeamSummary } from './types';

// TODO: замінити на дані з API. Rating/tier — поля, які адмін редагує вручну,
// до появи адмінки лежать тут як моки.
export const teams: TeamSummary[] = [
  { slug: 'spirit', name: 'Spirit', tier: 'T1', rating: 2018, roster: ['sh1ro', 'magixx', 'tN1R', 'zont1x', 'donk'] },
  { slug: 'falcons', name: 'Falcons', tier: 'T1', rating: 1982, roster: ['karrigan', 'NiKo', 'TeSeS', 'm0NESY', 'kyousuke'] },
  { slug: 'vitality', name: 'Vitality', tier: 'T1', rating: 1904, roster: ['apEX', 'ropz', 'ZywOo', 'flameZ', 'mezii'] },
  { slug: 'natus-vincere', name: 'Natus Vincere', tier: 'T1', rating: 1841, roster: ['Aleksib', 'iM', 'b1t', 'w0nderful', 'makazze'] },
  { slug: '9z', name: '9z', tier: 'T2', rating: 1840, roster: ['max', 'dgt', 'meyern', 'luchov', 'HUASOPEEK'] },
  { slug: 'furia', name: 'FURIA', tier: 'T2', rating: 1834, roster: ['FalleN', 'yuurih', 'YEKINDAR', 'KSCERATO', 'molodoy'] },
  { slug: 'legacy', name: 'Legacy', tier: 'T2', rating: 1806, roster: ['arT', 'dumau', 'latto', 'n1ssim', 'saadzin'] },
  { slug: 'mouz', name: 'MOUZ', tier: 'T1', rating: 1774, roster: ['torzsi', 'Spinx', 'jL', 'xertioN', 'xelex'] },
  { slug: 'betboom', name: 'BetBoom', tier: 'T1', rating: 1756, roster: ['Boombl4', 'zorte', 'd1Ledez', 'FL4MUS', 'Magnojez'] },
  { slug: 'g2', name: 'G2', tier: 'T1', rating: 1737, roster: ['huNter-', 'NertZ', 'SunPayus', 'HeavyGod', 'MATYS'] },
  { slug: 'aurora', name: 'Aurora', tier: 'T1', rating: 1728, roster: ['MAJ3R', 'XANTARES', 'woxic', 'soulfly', 'Wicadia'] },
  { slug: 'fut', name: 'FUT', tier: 'T1', rating: 1707, roster: ['dem0n', 'lauNX', 'Krabeni', 'cmtry', 'dziugss'] },
  { slug: 'parivision', name: 'PARIVISION', tier: 'T1', rating: 1698, roster: ['HObbit', 'Jame', 'xiELO', 'zweih', 'slaxejezzz'] },
];
