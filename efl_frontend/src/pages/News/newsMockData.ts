import type { NewsArticle } from './types';

// TODO: Р·Р°РјС–РЅРёС‚Рё РЅР° РґР°РЅС– Р· API. РљР°С‚РµРіРѕСЂС–СЏ С– "featured" вЂ” РїРѕР»СЏ, СЏРєС– Р°РґРјС–РЅ РІРёСЃС‚Р°РІР»СЏС”
// РІСЂСѓС‡РЅСѓ РїСЂРё СЃС‚РІРѕСЂРµРЅРЅС– РЅРѕРІРёРЅРё (РѕРїРёСЃР°РЅРѕ РІ РўР—).
export const newsArticles: NewsArticle[] = [
  {
    slug: 'registration',
    title: 'Registration for Season One is now open',
    category: 'Announcements',
    excerpt: 'Applications are now available for all eligible teams.',
    featured: true,
    author: 'ASCENT Team',
    date: 'July 25, 2026',
    readTime: '3 min read',
    body: `Registration for ASCENT CS2 League Season One is officially open.

Teams from all regions are invited to participate in the inaugural season. Applications remain available until August 10.

The league will feature a structured group stage followed by a **single elimination playoff bracket**.

Additional tournament rules, eligibility requirements and scheduling information can be found in the [Rules](/rules) section.`,
    infoBoxes: [
      { icon: 'calendar', label: 'Registration Closes', value: 'August 10, 2026' },
      { icon: 'flag', label: 'Season Starts', value: 'August 17, 2026' },
      { icon: 'users', label: 'Teams', value: '32' },
      { icon: 'trophy', label: 'Format', value: 'Double Elimination', subvalue: 'Groups + Playoffs' },
    ],
  },
  {
    slug: 'playoff-bracket-announced',
    title: 'Playoff bracket announced',
    category: 'Tournaments',
    excerpt: 'Top 16 teams advance to the playoffs.',
    author: 'ASCENT Team',
    date: 'July 25, 2026',
    readTime: '2 min read',
    body: `The playoff bracket for ASCENT Season One has been finalized after the close of the group stage.

The top 16 teams from the group stage have advanced to a **double elimination** playoff bracket, with the Grand Final scheduled for August 24.

Full bracket details are available on the [Tournaments](/tournaments) page.`,
  },
  {
    slug: 'tier-ranking-system',
    title: 'ASCENT introduces Tier Ranking System',
    category: 'League',
    excerpt: 'Teams are now separated into T1, T2 and T3 divisions.',
    author: 'ASCENT Team',
    date: 'July 22, 2026',
    readTime: '2 min read',
    body: `Starting this season, all registered teams are grouped into **T1**, **T2**, and **T3** divisions based on ASCENT Rating.

This tiering system helps balance qualification tournaments and gives newer teams a clearer path into the top division.

You can browse the current standings on the [Teams](/teams) page.`,
  },
  {
    slug: 'schedule-week-one',
    title: 'Schedule for Week One published',
    category: 'Matches',
    excerpt: 'All opening matches are now available.',
    author: 'ASCENT Team',
    date: 'July 20, 2026',
    readTime: '1 min read',
    body: `The full match schedule for Week One of the group stage is now live.

All opening matches are listed with their scheduled kickoff times. Teams should check in 15 minutes before their scheduled match time.

Check the Schedule tab on each tournament page for match-by-match details.`,
  },
  {
    slug: 'new-map-pool',
    title: 'New map pool for Season One',
    category: 'Announcements',
    excerpt: 'We have updated the official map pool for all matches.',
    author: 'ASCENT Team',
    date: 'July 18, 2026',
    readTime: '2 min read',
    body: `We've updated the official competitive map pool ahead of Season One.

The updated pool reflects the current **Counter-Strike 2** competitive map rotation and will be used across all group stage and playoff matches.

Full details on veto rules can be found in the [Rules](/rules) section.`,
  },
  {
    slug: 'client-update-anticheat',
    title: 'Client update and anti-cheat improvements',
    category: 'Updates',
    excerpt: 'Performance and security improvements are now live.',
    author: 'ASCENT Team',
    date: 'July 15, 2026',
    readTime: '1 min read',
    body: `We've rolled out a round of performance and security improvements ahead of Season One.

This update includes anti-cheat improvements alongside general stability and performance fixes across our official servers.

No action is required from players or teams.`,
  },
];

