export type TeamTier = 'T1' | 'T2' | 'T3';

export interface TeamSummary {
  slug: string;
  name: string;
  tier: TeamTier;
  /** ASCENT Rating — admin-editable ranking score, same idea as the Valve points reference. */
  rating: number;
  roster: string[];
}
