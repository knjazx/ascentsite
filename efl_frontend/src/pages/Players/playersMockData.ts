import type { PlayerStats } from './types';

// TODO: замінити на дані з API. Адмін вводить лише kills/deaths вручну —
// maps і rounds теж мають стати адмін-полями, коли з'явиться адмінка.
export const players: PlayerStats[] = [
  { id: 'p1', nickname: 'donk', team: 'Spirit', maps: 30, rounds: 696, kills: 663, deaths: 467 },
  { id: 'p2', nickname: 'ZywOo', team: 'Vitality', maps: 35, rounds: 757, kills: 648, deaths: 435 },
  { id: 'p3', nickname: 'insani', team: 'MIBR', maps: 22, rounds: 449, kills: 363, deaths: 333 },
  { id: 'p4', nickname: 'xertioN', team: 'MOUZ', maps: 38, rounds: 790, kills: 589, deaths: 495 },
  { id: 'p5', nickname: 'latto', team: 'Legacy', maps: 42, rounds: 896, kills: 712, deaths: 552 },
  { id: 'p6', nickname: 'm0NESY', team: 'Falcons', maps: 47, rounds: 1107, kills: 899, deaths: 661 },
  { id: 'p7', nickname: 'molodoy', team: 'FURIA', maps: 31, rounds: 652, kills: 531, deaths: 374 },
  { id: 'p8', nickname: 'sh1ro', team: 'Spirit', maps: 30, rounds: 696, kills: 547, deaths: 353 },
  { id: 'p9', nickname: 'HeavyGod', team: 'G2', maps: 40, rounds: 939, kills: 666, deaths: 611 },
  { id: 'p10', nickname: 'w0nderful', team: 'Natus Vincere', maps: 36, rounds: 776, kills: 609, deaths: 438 },
  { id: 'p11', nickname: 'kyousuke', team: 'Falcons', maps: 47, rounds: 1107, kills: 838, deaths: 755 },
  { id: 'p12', nickname: 'Wicadia', team: 'Aurora', maps: 23, rounds: 498, kills: 385, deaths: 329 },
  { id: 'p13', nickname: 'b1t', team: 'Natus Vincere', maps: 36, rounds: 776, kills: 582, deaths: 485 },
  { id: 'p14', nickname: 'frozen', team: 'FaZe Clan', maps: 27, rounds: 625, kills: 464, deaths: 407 },
  { id: 'p15', nickname: 'Magnojez', team: 'BetBoom Team', maps: 35, rounds: 716, kills: 497, deaths: 456 },
];
