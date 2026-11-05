export type NewsCategory = 'Announcements' | 'Tournaments' | 'Matches' | 'League' | 'Updates';

export const NEWS_CATEGORIES: NewsCategory[] = ['Announcements', 'Tournaments', 'Matches', 'League', 'Updates'];

export interface NewsInfoBox {
  icon: 'calendar' | 'flag' | 'users' | 'trophy';
  label: string;
  value: string;
  subvalue?: string;
}

export interface NewsArticle {
  slug: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  /** Discord-lite markdown: **bold**, # / ## / ### headings, [label](url) links, paragraphs separated by a blank line. */
  body: string;
  /** Admin picks exactly one article to feature at the top of the list — see newsMockData.ts */
  featured?: boolean;
  author: string;
  date: string;
  readTime: string;
  infoBoxes?: NewsInfoBox[];
}
