import type { TournamentDetail, TournamentSummary } from './types';

// TODO: Р·Р°РјС–РЅРёС‚Рё РЅР° РґР°РЅС– Р· API. РљРѕР»Рё Р·'СЏРІРёС‚СЊСЃСЏ Р°РґРјС–РЅРєР° вЂ” С†С– РѕР±'С”РєС‚Рё РІС–РґРїРѕРІС–РґР°СЋС‚СЊ
// РїРѕР»СЏРј, СЏРєС– Р°РґРјС–РЅ РјР°С” Р·Р°РїРѕРІРЅСЋРІР°С‚Рё РІСЂСѓС‡РЅСѓ (РѕРїРёСЃР°РЅРѕ РІ РўР—).
export const tournaments: TournamentSummary[] = [
  {
    slug: 'ASCENT-season-one',
    name: 'ASCENT Season One',
    type: 'Main Tournament',
    icon: 'trophy',
    season: 'Season One',
    teams: 32,
    dateRange: 'May 12 вЂ“ Aug 24, 2025',
    format: 'Double Elimination',
    status: 'ongoing',
    statusLabel: 'Group Stage',
  },
  {
    slug: 'ASCENT-open-cup',
    name: 'ASCENT Open Cup',
    type: 'Open Tournament',
    icon: 'target',
    season: 'Season One',
    teams: 64,
    dateRange: 'Aug 14 вЂ“ Aug 17, 2025',
    format: 'Single Elimination',
    status: 'upcoming',
    statusLabel: 'Registration Open',
  },
  {
    slug: 'ASCENT-qualification-cup',
    name: 'ASCENT Qualification Cup',
    type: 'Qualification Tournament',
    icon: 'shield',
    season: 'Season One',
    teams: 128,
    dateRange: 'Aug 2 вЂ“ Aug 4, 2025',
    format: 'Swiss System',
    status: 'upcoming',
    statusLabel: 'Registration Closed',
  },
  {
    slug: 'ASCENT-t2-cup',
    name: 'ASCENT T2 Cup',
    type: 'Secondary Tournament',
    icon: 'chevrons',
    season: 'Season One',
    teams: 32,
    dateRange: 'Jun 21 вЂ“ Jun 22, 2025',
    format: 'Single Elimination',
    status: 'completed',
    statusLabel: 'View Results',
  },
  {
    slug: 'ASCENT-t3-cup',
    name: 'ASCENT T3 Cup',
    type: 'Third Tier Tournament',
    icon: 'star',
    season: 'Season One',
    teams: 32,
    dateRange: 'Jun 7 вЂ“ Jun 8, 2025',
    format: 'Single Elimination',
    status: 'completed',
    statusLabel: 'View Results',
  },
];

// TODO: РґРµС‚Р°Р»СЊРЅС– РґР°РЅС– РїРѕРєРё РїСЂРѕРїРёСЃР°РЅС– РІСЂСѓС‡РЅСѓ Р»РёС€Рµ РґР»СЏ РіРѕР»РѕРІРЅРѕРіРѕ С‚СѓСЂРЅС–СЂСѓ.
// Р РµС€С‚Р° С‚СѓСЂРЅС–СЂС–РІ РѕС‚СЂРёРјР°СЋС‚СЊ СЃРІС–Р№ TournamentDetail, РєРѕР»Рё Р·СЂРѕР±РёРјРѕ Р°РґРјС–РЅРєСѓ РґР»СЏ С—С… Р·Р°РїРѕРІРЅРµРЅРЅСЏ.
export const tournamentDetails: Record<string, TournamentDetail> = {
  'ASCENT-season-one': {
    slug: 'ASCENT-season-one',
    name: 'ASCENT Season One',
    type: 'Main Tournament',
    icon: 'trophy',
    season: 'Season One',
    teams: 32,
    dateRange: 'May 12 вЂ“ Aug 24, 2025',
    format: 'Double Elimination',
    status: 'ongoing',
    statusLabel: 'Group Stage',
    tagline: 'The flagship tournament of ASCENT CS2 League. Thirty-two teams. One champion.',
    description: [
      'ASCENT Season One is the official main tournament of the league.',
      'The competition consists of a group stage followed by playoffs.',
    ],
    badges: ['32 Teams', '8 Groups', '16 Playoffs', 'Double Elim'],
    prizePool: 'TBA',
    organizer: 'ASCENT CS2 League',
    game: 'Counter-Strike 2',
    region: 'Europe',
    matchFormat: 'BO3 (Playoffs) / BO1 (Group Stage)',
    server: 'ASCENT Official Servers',
    anticheat: 'VAC Live',
    groups: ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'],
    stageProgress: [
      { label: 'Group Stage', dateRange: 'May 12 вЂ“ Jun 1', status: 'in-progress' },
      { label: 'Playoffs', dateRange: 'Jun 7 вЂ“ Aug 17', status: 'upcoming' },
      { label: 'Grand Final', dateRange: 'Aug 24', status: 'upcoming' },
    ],
    participatingTeams: [
      { name: 'Nexus' },
      { name: 'ORVIN' },
      { name: 'NPC' },
      { name: 'HEXORIA' },
      { name: 'X Team' },
      { name: 'Apex Predators' },
      { name: 'Fatum Esports' },
      { name: '300 TON' },
      // TODO: СЂРµС€С‚Р° РєРѕРјР°РЅРґ вЂ” Р·Р°РіР»СѓС€РєР°, РїРѕРєРё РЅРµРјР°С” СЂРµР°Р»СЊРЅРѕС— СЂРµС”СЃС‚СЂР°С†С–С— РЅР° С†РµР№ С‚СѓСЂРЅС–СЂ
      ...Array.from({ length: 24 }, (_, i) => ({ name: `Team ${String(i + 9).padStart(2, '0')}` })),
    ],
    // TODO: СЂРѕР·РєР»Р°Рґ Р·Р°РїРѕРІРЅРµРЅРёР№ Р»РёС€Рµ РЅР° РїР°СЂСѓ РЅР°Р№Р±Р»РёР¶С‡РёС… РґРЅС–РІ РґР»СЏ РїСЂРёРєР»Р°РґСѓ вЂ”
    // СЂРµС€С‚Р° Р·'СЏРІРёС‚СЊСЃСЏ СЂР°Р·РѕРј Р· РјРѕРґРµР»Р»СЋ РјР°С‚С‡С–РІ / Р°РґРјС–РЅРєРѕСЋ.
    schedule: [
      { id: 's1', stage: 'Group Stage вЂ” Group A', teamA: 'Nexus', teamB: 'ORVIN', date: 'Aug 10, 2025', time: '16:00 UTC' },
      { id: 's2', stage: 'Group Stage вЂ” Group A', teamA: 'NPC', teamB: 'HEXORIA', date: 'Aug 10, 2025', time: '18:30 UTC' },
      { id: 's3', stage: 'Group Stage вЂ” Group B', teamA: 'X Team', teamB: 'Apex Predators', date: 'Aug 11, 2025', time: '16:00 UTC' },
      { id: 's4', stage: 'Group Stage вЂ” Group B', teamA: 'Fatum Esports', teamB: '300 TON', date: 'Aug 11, 2025', time: '18:30 UTC' },
      { id: 's5', stage: 'Group Stage вЂ” Group A', teamA: 'Nexus', teamB: 'NPC', date: 'Aug 13, 2025', time: '17:00 UTC' },
    ],
    // TODO: С‚РµСЃС‚РѕРІС– СЂРµР·СѓР»СЊС‚Р°С‚Рё вЂ” СЂРµР°Р»СЊРЅС– РїСЂРёР№РґСѓС‚СЊ Р· РјРѕРґРµР»С– РјР°С‚С‡С–РІ
    results: [
      { id: 'r1', stage: 'Group Stage вЂ” Group A', teamA: 'Nexus', teamB: 'HEXORIA', scoreA: 13, scoreB: 7, date: 'Aug 3, 2025' },
      { id: 'r2', stage: 'Group Stage вЂ” Group A', teamA: 'ORVIN', teamB: 'NPC', scoreA: 9, scoreB: 13, date: 'Aug 3, 2025' },
      { id: 'r3', stage: 'Group Stage вЂ” Group B', teamA: 'X Team', teamB: '300 TON', scoreA: 13, scoreB: 6, date: 'Aug 4, 2025' },
      { id: 'r4', stage: 'Group Stage вЂ” Group B', teamA: 'Apex Predators', teamB: 'Fatum Esports', scoreA: 11, scoreB: 13, date: 'Aug 4, 2025' },
    ],
    // TODO: СЂР°С…СѓС”С‚СЊСЃСЏ РІСЂСѓС‡РЅСѓ Р°РґРјС–РЅРѕРј РЅР° С†СЊРѕРјСѓ РµС‚Р°РїС–, Р°РІС‚РѕРјР°С‚РёС‡РЅРёР№ РїС–РґСЂР°С…СѓРЅРѕРє вЂ” РїС–Р·РЅС–С€Рµ
    standings: [
      {
        group: 'Group A',
        rows: [
          { team: 'NPC', wins: 2, losses: 0, mapsWon: 26, mapsLost: 16, points: 6 },
          { team: 'Nexus', wins: 1, losses: 1, mapsWon: 20, mapsLost: 20, points: 3 },
          { team: 'HEXORIA', wins: 1, losses: 1, mapsWon: 19, mapsLost: 20, points: 3 },
          { team: 'ORVIN', wins: 0, losses: 2, mapsWon: 15, mapsLost: 24, points: 0 },
        ],
      },
      {
        group: 'Group B',
        rows: [
          { team: 'X Team', wins: 1, losses: 0, mapsWon: 13, mapsLost: 6, points: 3 },
          { team: 'Fatum Esports', wins: 1, losses: 0, mapsWon: 13, mapsLost: 11, points: 3 },
          { team: 'Apex Predators', wins: 0, losses: 1, mapsWon: 11, mapsLost: 13, points: 0 },
          { team: '300 TON', wins: 0, losses: 1, mapsWon: 6, mapsLost: 13, points: 0 },
        ],
      },
    ],
    rules: [
      {
        title: 'Format',
        content: [
          'ASCENT Season One consists of a group stage followed by a double-elimination playoff bracket.',
          'The group stage is played in BO1 format; playoff matches are played BO3, with the Grand Final played BO5.',
        ],
      },
      {
        title: 'Roster Rules',
        content: [
          'Each team must register 5 main players and may register up to 2 substitutes.',
          'Roster changes are locked once the group stage begins, except in case of a documented emergency.',
        ],
      },
      {
        title: 'Match Conduct',
        content: [
          'Teams must be ready to check in 15 minutes before the scheduled match time.',
          'A 10-minute grace period is given for no-shows before the match is forfeited.',
        ],
      },
      {
        title: 'Anti-Cheat & Fair Play',
        content: [
          'All players must have VAC Live enabled and, if requested, install the official ASCENT overwatch client.',
          'Any confirmed case of cheating results in an immediate disqualification of the team from the tournament.',
        ],
      },
    ],
  },
};

