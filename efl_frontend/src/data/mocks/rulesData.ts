import type { RuleSection } from '@/types';

export const ruleSections: RuleSection[] = [
  {
    id: 'general',
    icon: 'book',
    title: 'General Regulations',
    badge: 'General',
    rules: [
      {
        number: '1.1',
        title: 'League Mission',
        description:
          'ASCENT is an esports organization hosting official online tournaments. The league provides equal competing conditions for all teams regardless of region or tier.',
      },
      {
        number: '1.2',
        title: 'Compliance with Rules',
        description:
          'All participants, team captains, and coaches are required to read the rules and agree to abide by them from the moment of registration.',
        highlight: true,
        severity: 'info',
      },
      {
        number: '1.3',
        title: 'Amendments to Regulations',
        description:
          'ASCENT reserves the right to amend the rules at any time. All changes take effect upon publication on the official website with at least 48 hours prior notice.',
      },
      {
        number: '1.4',
        title: 'Official Language',
        description:
          'The official language of communication with the administration is English or Ukrainian. For international tournaments, communication is strictly in English.',
      },
    ],
  },
  {
    id: 'teams',
    icon: 'users',
    title: 'Teams & Registration',
    badge: 'Teams',
    rules: [
      {
        number: '2.1',
        title: 'Team Roster',
        description:
          'Each team must consist of 5 to 8 players (5 starters + up to 3 substitutes). Players are permitted to compete for only one team per season.',
        highlight: true,
        severity: 'info',
      },
      {
        number: '2.2',
        title: 'Team Captain',
        description:
          'Each team must designate a captain who serves as the official representative to the ASCENT administration. The captain is responsible for the conduct of all team members.',
      },
      {
        number: '2.3',
        title: 'Player Registration',
        description:
          'Roster additions are open during the first two weeks of the season. After this period, roster transfers are permitted only in the event of an injury or disqualification of a primary player.',
      },
      {
        number: '2.4',
        title: 'Participant Age',
        description:
          'The minimum age to participate in ASCENT tournaments is 16. Written consent from a parent or legal guardian is required for players under 18 years of age.',
      },
      {
        number: '2.5',
        title: 'Team Name & Tag',
        description:
          'Team names and in-game tags must not contain profanity, offensive language, or copyrighted terms. ASCENT reserves the right to reject improper registrations.',
      },
    ],
  },
  {
    id: 'gameplay',
    icon: 'gamepad',
    title: 'Gameplay & Matches',
    badge: 'Gameplay',
    rules: [
      {
        number: '3.1',
        title: 'Match Settings',
        description:
          'All matches are hosted on official ASCENT servers. Map pools, game modes, and match settings are determined by the administration prior to each tournament.',
      },
      {
        number: '3.2',
        title: 'Punctuality',
        description:
          'Teams must be in the match lobby ready to play 15 minutes before the scheduled time. If a team is not ready within 10 minutes past the start time, a forfeit loss will be issued.',
        highlight: true,
        severity: 'warning',
      },
      {
        number: '3.3',
        title: 'Technical Issues',
        description:
          'In case of technical difficulties (disconnections, crashes), a team may request a technical pause of up to 10 minutes. Each team is granted a maximum of 3 technical pauses per season.',
      },
      {
        number: '3.4',
        title: 'Substitutions During Match',
        description:
          'Player substitutions may only occur between maps or rounds. Substitutions during an active game round are strictly prohibited.',
      },
      {
        number: '3.5',
        title: 'Match-Fixing & Manipulation',
        description:
          'Intentionally throwing matches (match-fixing), result manipulation, or colluding with opponents is strictly prohibited. Violations result in an immediate lifetime ban.',
        highlight: true,
        severity: 'danger',
      },
    ],
  },
  {
    id: 'conduct',
    icon: 'user-check',
    title: 'Code of Conduct',
    badge: 'Conduct',
    rules: [
      {
        number: '4.1',
        title: 'Respect & Sportsmanship',
        description:
          'All participants are required to respect opponents, referees, and administration. Mutual respect and fair play are fundamental values of ASCENT.',
        highlight: true,
        severity: 'info',
      },
      {
        number: '4.2',
        title: 'Anti-Toxicity Policy',
        description:
          'Personal insults, racist, sexist, or discriminatory remarks in any form are strictly forbidden in both text and voice channels.',
      },
      {
        number: '4.3',
        title: 'Social Media Presence',
        description:
          'League participants represent ASCENT in public spaces. Defamation of the league, tournaments, or other participants on social media may lead to disciplinary sanctions.',
      },
      {
        number: '4.4',
        title: 'Streaming & Media',
        description:
          'Participants may stream matches with a minimum stream delay of 5 minutes. For top-tier matches, a delay of 10 minutes is mandatory. Non-compliance results in fines or disqualification.',
      },
    ],
  },
  {
    id: 'cheating',
    icon: 'ban',
    title: 'Cheating & Illegal Software',
    badge: 'Anti-Cheat',
    rules: [
      {
        number: '5.1',
        title: 'Cheating & Hacking',
        description:
          'Using third-party programs or software providing an unfair advantage (aimbots, wallhacks, macros, speedhacks, etc.) is strictly forbidden. The penalty is an automatic lifetime ban.',
        highlight: true,
        severity: 'danger',
      },
      {
        number: '5.2',
        title: 'Suspicious Accounts & PC Checks',
        description:
          'ASCENT reserves the right to request access to game logs or conduct PC inspections. Refusal to comply with an inspection is treated as an admission of guilt.',
      },
      {
        number: '5.3',
        title: 'Smurfing & Account Sharing',
        description:
          'Players are prohibited from competing on lower-ranked alternate accounts. All registered accounts must match the player real identity. Violations lead to team disqualification.',
        highlight: true,
        severity: 'warning',
      },
      {
        number: '5.4',
        title: 'Forbidden Software',
        description:
          'Using software not included in the official ASCENT approved software list is forbidden. The whitelist is published prior to the start of each season.',
      },
    ],
  },
  {
    id: 'penalties',
    icon: 'gavel',
    title: 'Penalties & Sanctions',
    badge: 'Penalties',
    rules: [
      {
        number: '6.1',
        title: 'Warning System',
        description:
          'Minor infractions result in a yellow card (warning). Accumulating two yellow cards results in a red card (1-match suspension). Cards reset at the end of the season.',
      },
      {
        number: '6.2',
        title: 'Penalty Points',
        description:
          'For specific breaches, teams receive penalty points impacting their ranking. Accumulating more than 10 penalty points in a season leads to mandatory tier demotion.',
        highlight: true,
        severity: 'warning',
      },
      {
        number: '6.3',
        title: 'Temporary Suspension',
        description:
          'For severe infractions, a player may be suspended from all league activities for a duration of 1 to 12 months. Decisions are finalized by the ASCENT Appeals Committee.',
      },
      {
        number: '6.4',
        title: 'Lifetime Ban',
        description:
          'Cheating, bribery, match-fixing, and public defamation of ASCENT will result in a permanent lifetime ban across all league tournaments.',
        highlight: true,
        severity: 'danger',
      },
      {
        number: '6.5',
        title: 'Appeals Process',
        description:
          'Any penalty or disqualification decision can be appealed within 48 hours via the official ASCENT Discord server. The Appeals Committee reviews submissions within 5 business days.',
      },
    ],
  },
  {
    id: 'tournaments',
    icon: 'trophy',
    title: 'Tournament Structure',
    badge: 'Structure',
    rules: [
      {
        number: '7.1',
        title: 'Tier System',
        description:
          'ASCENT is structured into 4 Tiers: T1 (Pro League), T2 (Elite League), T3 (Main League), T4 (Open League). Promotion and demotion take place at the end of each season based on total points.',
        highlight: true,
        severity: 'info',
      },
      {
        number: '7.2',
        title: 'Season Format',
        description:
          'The regular season consists of a round-robin group stage followed by single/double elimination playoffs. Specific formats are announced prior to each season.',
      },
      {
        number: '7.3',
        title: 'Match Scheduling',
        description:
          'Matches take place primarily on weekends. Official schedules are delivered to team captains 7 days prior. Reschedules must be approved by administration.',
      },
      {
        number: '7.4',
        title: 'Prize Distribution',
        description:
          'Prize pool details are announced separately for each event. ASCENT guarantees prize payouts within 30 days following tournament completion.',
      },
    ],
  },
  {
    id: 'schedule',
    icon: 'clock',
    title: 'Time Regulations',
    badge: 'Schedule',
    rules: [
      {
        number: '8.1',
        title: 'Registration Window',
        description:
          'Tournament registration opens 14 days before competition start. Registration closes 48 hours prior to the first match. Late entries are not accepted.',
      },
      {
        number: '8.2',
        title: 'Check-in Requirement',
        description:
          'Mandatory check-in opens 2 hours before match time and closes 30 minutes before start. Teams failing to check in are automatically disqualified.',
        highlight: true,
        severity: 'warning',
      },
      {
        number: '8.3',
        title: 'Technical Pauses Duration',
        description:
          'Technical pauses are limited to 10 minutes maximum. If issues persist beyond this window, referee discretion applies regarding reschedule or forfeit.',
      },
    ],
  },
];

