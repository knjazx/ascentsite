export interface RosterPlayer {
  id: string;
  nickname: string;
  steamUrl: string;
}

export interface TeamRegistrationValues {
  teamName: string;
  teamTag: string;
  discordLink: string;
  contactEmail: string;
  captainNickname: string;
  captainSteamUrl: string;
  mainRoster: RosterPlayer[];
  substitutes: RosterPlayer[];
  logo: File | null;
}

export function createEmptyPlayer(): RosterPlayer {
  return { id: crypto.randomUUID(), nickname: '', steamUrl: '' };
}

export const MAIN_ROSTER_SIZE = 5;
export const MAX_SUBSTITUTES = 2;
