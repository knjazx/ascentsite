export type ChangelogType = 'added' | 'modified' | 'clarified' | 'removed';

export type ChangelogCategory =
  | 'General'
  | 'Teams & Rosters'
  | 'Sponsorship & Branding'
  | 'Match Operations'
  | 'Integrity & Anti-Cheat'
  | 'Penalties & Winnings';

export interface ChangelogItem {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  category: ChangelogCategory;
  type: ChangelogType;
  title: string;
  description: string;
  previousNote?: string;
  details?: string[];
  version?: string;
  createdAt?: string;
}

export interface RulebookRelease {
  id: string;
  version: string;
  title: string;
  releaseDate: string;
  effectiveDate: string;
  isCurrent: boolean;
  rulebookUrl: string;
  summary: string;
  changes: ChangelogItem[];
}

export const rulebookReleases: RulebookRelease[] = [
  {
    id: 'update-2026-2',
    version: '2026 Update #2 (v2.4)',
    title: 'ASCENT Counter-Strike Rulebook 2026 — Update #2 & Changelog',
    releaseDate: '7 июля 2026',
    effectiveDate: '15 июля 2026',
    isCurrent: true,
    rulebookUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    summary:
      'Официальный Регламент соревнований ASCENT CS2 League. Здесь публикуются все утвержденные изменения, новые статьи и дисциплинарные регламенты лиги.',
    changes: [],
  },
];
