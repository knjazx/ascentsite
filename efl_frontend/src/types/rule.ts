export type RuleIconName =
  | 'book'
  | 'users'
  | 'gamepad'
  | 'user-check'
  | 'ban'
  | 'gavel'
  | 'trophy'
  | 'clock';

export type RuleSeverity = 'warning' | 'danger' | 'info';

export interface RuleItem {
  number: string;
  title: string;
  description: string;
  highlight?: boolean;
  severity?: RuleSeverity;
}

export interface RuleSection {
  id: string;
  icon: RuleIconName;
  title: string;
  badge?: string;
  rules: RuleItem[];
}
