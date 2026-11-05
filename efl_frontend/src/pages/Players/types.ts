export interface PlayerStats {
  id: string;
  nickname: string;
  team: string;
  maps: number;
  rounds: number;
  /** Admin enters raw kills/deaths — K/D and K-D Diff are always derived, never stored directly. */
  kills: number;
  deaths: number;
}

export type SortKey = 'maps' | 'rounds' | 'kdDiff' | 'kd';
export type SortDirection = 'asc' | 'desc';

export function getKD(player: PlayerStats): number {
  if (player.deaths === 0) return player.kills;
  return player.kills / player.deaths;
}

export function getKDDiff(player: PlayerStats): number {
  return player.kills - player.deaths;
}
