import React, { useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { teams as mockTeams } from '@/data/mocks/teamsMockData';
import TeamLogo from './components/TeamLogo';
import TierBadge from './components/TierBadge';
import {
  Activity,
  Users,
  Swords,
  Trophy,
  Target,
  TrendingUp,
  ExternalLink,
  Shield,
  User,
  Calendar,
  Flame,
  Award,
  Share2,
  Bookmark,
  Check,
  ArrowUpRight,
  Crown,
  ChevronRight,
  Globe
} from 'lucide-react';
import { getPlayerProfile } from '@/data/mocks/playersMockData';
import { getPlayerRating } from '@/types';
import CountryFlag, { PLAYER_COUNTRIES } from '@/components/ui/CountryFlag/CountryFlag';
import './TeamProfilePage.css';

type Tab = 'overview' | 'roster' | 'matches' | 'achievements' | 'mappool';
type MatchFilter = 'all' | 'W' | 'L';

interface TeamMapStat {
  mapName: string;
  winRate: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ctWinRate: number;
  tWinRate: number;
  rating: number;
  pickPriority?: 'signature' | 'comfort' | 'permaban';
}

interface TeamAchievement {
  id: string;
  title: string;
  event: string;
  date: string;
  placement: string;
  prize?: string;
  tier?: string;
}

interface TeamRecentMatch {
  id: string;
  event: string;
  opponent: string;
  opponentSlug: string;
  date: string;
  result: 'W' | 'L';
  score: string;
  map: string;
  format?: string;
}

interface EnrichedPlayer {
  nickname: string;
  realName?: string;
  role: string;
  roleType: 'awp' | 'igl' | 'entry' | 'star' | 'support';
  rating: number;
  adr: number;
  kd: number;
  kastPct?: number;
  headshotPct?: number;
  age?: number;
  image?: string;
  isCaptain?: boolean;
  isSniper?: boolean;
}

interface EnrichedTeamProfile {
  slug: string;
  name: string;
  tag: string;
  tier: 'T1' | 'T2' | 'T3';
  rating: number;
  worldRank: number;
  founded: string;
  region: string;
  coach: string;
  analyst: string;
  manager: string;
  totalEarnings?: string;
  twitterUrl?: string;
  discordUrl?: string;
  twitchUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  bio: string;
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    roundWinRate: number;
    mapWinRate: number;
    streak: string;
    recentForm: Array<'W' | 'L'>;
    pistolWinRate: number;
    overtimeWinRate: number;
    ctWinRate: number;
    tWinRate: number;
    clutchWinRate: number;
    openingDuelWinRate: number;
    totalRoundsPlayed: number;
  };
  roster: EnrichedPlayer[];
  mapStats: TeamMapStat[];
  achievements: TeamAchievement[];
  recentMatches: TeamRecentMatch[];
}

const DEFAULT_MAP_STATS: TeamMapStat[] = [
  { mapName: 'Mirage', winRate: 74, matchesPlayed: 19, wins: 14, losses: 5, ctWinRate: 58, tWinRate: 54, rating: 1.18, pickPriority: 'signature' },
  { mapName: 'Nuke', winRate: 68, matchesPlayed: 16, wins: 11, losses: 5, ctWinRate: 62, tWinRate: 48, rating: 1.14, pickPriority: 'comfort' },
  { mapName: 'Dust II', winRate: 64, matchesPlayed: 14, wins: 9, losses: 5, ctWinRate: 52, tWinRate: 56, rating: 1.10, pickPriority: 'comfort' },
  { mapName: 'Ancient', winRate: 60, matchesPlayed: 10, wins: 6, losses: 4, ctWinRate: 55, tWinRate: 50, rating: 1.08, pickPriority: 'comfort' },
  { mapName: 'Anubis', winRate: 58, matchesPlayed: 12, wins: 7, losses: 5, ctWinRate: 46, tWinRate: 58, rating: 1.05, pickPriority: 'comfort' },
  { mapName: 'Inferno', winRate: 45, matchesPlayed: 8, wins: 3, losses: 5, ctWinRate: 50, tWinRate: 42, rating: 0.98, pickPriority: 'permaban' },
];

const DEFAULT_ACHIEVEMENTS: TeamAchievement[] = [
  { id: 'a1', title: 'ASCENT Season One Champion', event: 'ASCENT Season One Grand Finals', date: 'Авг 2025', placement: '1-е место', prize: '$50,000', tier: 'T1' },
  { id: 'a2', title: 'ASCENT Masters Winter Finalist', event: 'ASCENT Masters Cup', date: 'Фев 2025', placement: '2-е место', prize: '$20,000', tier: 'T1' },
  { id: 'a3', title: 'ASCENT Open Series Cup Winner', event: 'ASCENT Open Series', date: 'Дек 2024', placement: '1-е место', prize: '$15,000', tier: 'T2' },
  { id: 'a4', title: 'ASCENT Spring Invitational Top 4', event: 'ASCENT Championship', date: 'Май 2024', placement: '3-4 место', prize: '$8,000', tier: 'T1' },
];

const DEFAULT_RECENT_MATCHES: TeamRecentMatch[] = [
  { id: 'm1', opponent: 'FaZe Clan', opponentSlug: 'faze', event: 'ASCENT Season One — Плей-офф', date: 'Сегодня', result: 'W', score: '2 - 0', map: 'Mirage, Nuke', format: 'Bo3' },
  { id: 'm2', opponent: 'Vitality', opponentSlug: 'vitality', event: 'ASCENT Season One', date: '14 авг 2025', result: 'W', score: '2 - 1', map: 'Dust II, Nuke, Anubis', format: 'Bo3' },
  { id: 'm3', opponent: 'MOUZ', opponentSlug: 'mouz', event: 'ASCENT Masters Cup', date: '10 авг 2025', result: 'L', score: '1 - 2', map: 'Mirage, Ancient, Inferno', format: 'Bo3' },
  { id: 'm4', opponent: 'FURIA', opponentSlug: 'furia', event: 'ASCENT Open Cup', date: '04 авг 2025', result: 'W', score: '2 - 0', map: 'Nuke, Mirage', format: 'Bo3' },
  { id: 'm5', opponent: 'G2 Esports', opponentSlug: 'g2', event: 'ASCENT Invitational', date: '28 июл 2025', result: 'W', score: '2 - 0', map: 'Ancient, Dust II', format: 'Bo3' },
  { id: 'm6', opponent: 'Natus Vincere', opponentSlug: 'natus-vincere', event: 'ASCENT Season One', date: '20 июл 2025', result: 'L', score: '0 - 2', map: 'Mirage, Dust II', format: 'Bo3' },
];

const TEAM_METADATA: Record<string, { tag: string; region: string; coach: string; analyst: string; manager: string; earnings: string; founded: string }> = {
  spirit: { tag: 'TS', region: 'CIS / Международный', coach: 'hally', analyst: 'Pashano', manager: 'Cheshir', earnings: '$1,850,000', founded: '2015' },
  falcons: { tag: 'FLC', region: 'Европа', coach: 'zonic', analyst: 'larsen', manager: 'Grant', earnings: '$720,000', founded: '2017' },
  vitality: { tag: 'VIT', region: 'Европа / Франция', coach: 'XTQZZZ', analyst: 'MaT', manager: 'Neo', earnings: '$2,450,000', founded: '2018' },
  'natus-vincere': { tag: 'NAVI', region: 'Европа / Украина', coach: 'B1ad3', analyst: 'Flashie', manager: 'cabbie', earnings: '$4,120,000', founded: '2009' },
  mouz: { tag: 'MOUZ', region: 'Европа', coach: 'sycrone', analyst: 'TOBIZ', manager: 'rejin', earnings: '$1,650,000', founded: '2002' },
  g2: { tag: 'G2', region: 'Европа', coach: 'TaZ', analyst: 'Swani', manager: 'Nia', earnings: '$3,180,000', founded: '2015' },
  furia: { tag: 'FUR', region: 'Бразилия / Америка', coach: 'sidde', analyst: 'hunter', manager: 'akashi', earnings: '$890,000', founded: '2017' },
  '9z': { tag: '9Z', region: 'Южная Америка', coach: 'tutehen', analyst: 'pino', manager: 'zakk', earnings: '$340,000', founded: '2018' },
  betboom: { tag: 'BB', region: 'CIS', coach: 'RAILWAY', analyst: 'Innershine', manager: 'Lukawa', earnings: '$410,000', founded: '2023' },
  aurora: { tag: 'AUR', region: 'CIS', coach: 'brain', analyst: 'vlad', manager: 'alex', earnings: '$290,000', founded: '2022' },
  legacy: { tag: 'LGC', region: 'Бразилия', coach: 'chucky', analyst: 'pepe', manager: 'felipe', earnings: '$180,000', founded: '2023' },
  fut: { tag: 'FUT', region: 'Европа', coach: 'sunshine', analyst: 'mert', manager: 'semih', earnings: '$150,000', founded: '2022' },
  parivision: { tag: 'PARI', region: 'CIS', coach: 'dastan', analyst: 'fabi', manager: 'ivan', earnings: '$210,000', founded: '2023' },
};

function getRoleType(roleStr: string, idx: number): 'awp' | 'igl' | 'entry' | 'star' | 'support' {
  const lower = roleStr.toLowerCase();
  if (lower.includes('awp') || lower.includes('sniper')) return 'awp';
  if (lower.includes('captain') || lower.includes('igl') || lower.includes('lead')) return 'igl';
  if (lower.includes('entry') || lower.includes('fragger')) return 'entry';
  if (lower.includes('star') || lower.includes('rifle')) return 'star';
  if (lower.includes('support') || lower.includes('anchor')) return 'support';
  const defaults: Array<'igl' | 'awp' | 'entry' | 'star' | 'support'> = ['igl', 'awp', 'entry', 'star', 'support'];
  return defaults[idx % defaults.length];
}

function getEnrichedTeamProfile(rawTeam: any, index: number, dynamicPlayers?: any[]): EnrichedTeamProfile {
  const matches = rawTeam.stats?.matchesPlayed || 45;
  const wins = rawTeam.stats?.wins || 28;
  const losses = rawTeam.stats?.losses || Math.max(1, matches - wins);
  const winRate = rawTeam.stats?.winRate || Math.round((wins / matches) * 100);

  const teamMeta = TEAM_METADATA[rawTeam.slug] || {
    tag: rawTeam.name.slice(0, 3).toUpperCase(),
    region: 'Международный',
    coach: rawTeam.coach || 'Head Coach',
    analyst: rawTeam.analyst || 'Tactical Analyst',
    manager: rawTeam.manager || 'Team Manager',
    earnings: '$500,000',
    founded: rawTeam.founded || '2022',
  };

  const defaultRoles = [
    { title: 'Капитан / IGL', type: 'igl' as const },
    { title: 'AWP Снайпер', type: 'awp' as const },
    { title: 'Энтри-фраггер', type: 'entry' as const },
    { title: 'Стар Рифлер', type: 'star' as const },
    { title: 'Опорник / Саппорт', type: 'support' as const },
  ];

  const roster: EnrichedPlayer[] = (rawTeam.roster || []).map((p: any, idx: number) => {
    const pProfile = p.nickname ? getPlayerProfile(p.nickname, dynamicPlayers) : null;
    const calculatedKd = pProfile && pProfile.deaths > 0 ? Number((pProfile.kills / pProfile.deaths).toFixed(2)) : (p.kd || 1.08);

    const defaultDef = defaultRoles[idx % defaultRoles.length];
    const roleTitle = p.role || pProfile?.role || defaultDef.title;
    const roleType = getRoleType(roleTitle, idx);

    return {
      nickname: p.nickname,
      realName: p.realName || pProfile?.realName || undefined,
      role: roleTitle,
      roleType,
      rating: pProfile ? getPlayerRating(pProfile) : (p.rating || 1.12),
      adr: pProfile?.adr || p.adr || 82.4,
      kd: calculatedKd,
      kastPct: pProfile?.kastPct || 74.2,
      headshotPct: pProfile?.headshotPct || 48.6,
      age: pProfile?.age,
      image: pProfile?.avatar || p.image || undefined,
      isCaptain: p.isCaptain || roleType === 'igl' || idx === 0,
      isSniper: p.isSniper || roleType === 'awp' || idx === 1,
    };
  });

  return {
    slug: rawTeam.slug,
    name: rawTeam.name,
    tag: teamMeta.tag,
    tier: rawTeam.tier || 'T1',
    rating: rawTeam.rating || 1850,
    worldRank: rawTeam.worldRank || (index + 1),
    founded: teamMeta.founded,
    region: teamMeta.region,
    coach: teamMeta.coach,
    analyst: teamMeta.analyst,
    manager: teamMeta.manager,
    totalEarnings: teamMeta.earnings,
    bio: rawTeam.bio || `${rawTeam.name} — профессиональная киберспортивная организация по Counter-Strike 2, выступающая в дивизионе ${rawTeam.tier || 'T1'} лиги ASCENT. Команда известна стратегической гибкостью, дисциплиной раундов и сильной индивидуальной огневой мощью игроков.`,
    twitterUrl: rawTeam.twitterUrl || `https://twitter.com/${rawTeam.slug}`,
    discordUrl: rawTeam.discordUrl || `https://discord.gg/${rawTeam.slug}`,
    twitchUrl: rawTeam.twitchUrl || `https://twitch.tv/${rawTeam.slug}`,
    websiteUrl: rawTeam.websiteUrl || `https://${rawTeam.slug}.gg`,
    telegramUrl: rawTeam.telegramUrl || `https://t.me/${rawTeam.slug}`,
    stats: {
      matchesPlayed: matches,
      wins,
      losses,
      winRate,
      roundWinRate: rawTeam.stats?.roundWinRate || 55.4,
      mapWinRate: winRate,
      streak: rawTeam.stats?.streak || 'W3',
      recentForm: ['W', 'W', 'L', 'W', 'W'],
      pistolWinRate: rawTeam.stats?.pistolWinRate || 59.8,
      overtimeWinRate: rawTeam.stats?.overtimeWinRate || 68.2,
      ctWinRate: 57.8,
      tWinRate: 53.2,
      clutchWinRate: 64.5,
      openingDuelWinRate: 56.1,
      totalRoundsPlayed: matches * 24,
    },
    roster,
    mapStats: rawTeam.mapStats || DEFAULT_MAP_STATS,
    achievements: (rawTeam.achievements && rawTeam.achievements.length > 0 && typeof rawTeam.achievements[0] === 'object'
      ? rawTeam.achievements
      : DEFAULT_ACHIEVEMENTS),
    recentMatches: (rawTeam.recentMatches && rawTeam.recentMatches.length > 0
      ? rawTeam.recentMatches.map((m: any, i: number) => ({
          id: m.id || `rm-${i}`,
          event: m.event || (i === 0 ? 'ASCENT Season One — Плей-офф' : 'ASCENT Masters Cup'),
          opponent: m.opponent || 'Vitality',
          opponentSlug: m.opponentSlug || (m.opponent || 'vitality').toLowerCase().replace(/\s+/g, '-'),
          date: m.date || 'Недавно',
          result: (m.result === 'W' || m.result === 'L' ? m.result : 'W') as 'W' | 'L',
          score: m.score || '2 - 0',
          map: m.map || (i % 2 === 0 ? 'Mirage, Nuke' : 'Dust II, Anubis'),
          format: m.format || 'Bo3',
        }))
      : DEFAULT_RECENT_MATCHES),
  };
}

const TeamProfilePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { teams: dynamicTeams, players: dynamicPlayers } = useData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as Tab;
  const validTabs: Tab[] = ['overview', 'roster', 'matches', 'achievements', 'mappool'];
  const [activeTab, setActiveTabState] = useState<Tab>(validTabs.includes(urlTab) ? urlTab : 'overview');

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [isFollowed, setIsFollowed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const allTeams = dynamicTeams && dynamicTeams.length > 0 ? dynamicTeams : mockTeams;
  const teamIndex = allTeams.findIndex((t) => t.slug === slug);
  const rawTeam = teamIndex >= 0 ? allTeams[teamIndex] : null;

  const team = useMemo(() => {
    if (!rawTeam) return null;
    return getEnrichedTeamProfile(rawTeam, teamIndex, dynamicPlayers);
  }, [rawTeam, teamIndex, dynamicPlayers]);

  if (!team) {
    return (
      <section className="team-profile-page">
        <div className="container">
          <div className="panel tp-not-found">
            <h2>Команда не найдена</h2>
            <p className="text-secondary">
              Запрашиваемый клуб с тегом «{slug}» отсутствует в реестре команд лиги ASCENT.
            </p>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/stats?tab=teams" className="btn-primary" style={{ display: 'inline-flex' }}>
                Вернуться к списку команд
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleToggleFollow = () => {
    setIsFollowed((prev) => {
      const next = !prev;
      showToast(next ? `Вы подписались на команду ${team.name}` : `Вы отписались от команды ${team.name}`, 'info');
      return next;
    });
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Ссылка на профиль команды скопирована!', 'success');
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      showToast('Не удалось скопировать ссылку', 'error');
    }
  };

  const filteredMatches = team.recentMatches.filter((m) => {
    if (matchFilter === 'all') return true;
    return m.result === matchFilter;
  });

  const captainPlayer = team.roster.find((p) => p.isCaptain) || team.roster[0];

  return (
    <section className="team-profile-page">
      <div className="container">
        {/* Breadcrumb Navigation — exact site style */}
        <div className="tp-breadcrumb">
          <Link to="/">Главная</Link>
          <ChevronRight size={13} className="tp-breadcrumb-sep" />
          <Link to="/stats?tab=teams">Команды</Link>
          <ChevronRight size={13} className="tp-breadcrumb-sep" />
          <span className="tp-breadcrumb-current">{team.name}</span>
        </div>

        {/* Hero Card — styled identically to PlayerProfilePage pp-hero */}
        <div className="panel tp-hero">
          <div className="tp-hero__left">
            <div className="tp-logo-wrapper">
              <TeamLogo name={team.name} size="xl" />
            </div>

            <div className="tp-hero__identity">
              <div className="tp-hero__name-row">
                <h1 className="tp-team-name">{team.name}</h1>
                <span className="tp-tag-pill">[{team.tag}]</span>
                <TierBadge tier={team.tier} />
                <span className="tp-meta-tag tp-meta-tag--rank">
                  <Flame size={13} />
                  <span>#{team.worldRank} ASCENT</span>
                </span>
              </div>

              <div className="tp-meta-row">
                <span className="tp-meta-tag">
                  <Globe size={13} />
                  <span>{team.region}</span>
                </span>
                <span className="tp-meta-tag">
                  <Calendar size={13} />
                  <span>Осн. {team.founded}</span>
                </span>
                <span className="tp-meta-tag">
                  <Shield size={13} />
                  <span>Тренер: {team.coach}</span>
                </span>
                {captainPlayer && (
                  <span className="tp-meta-tag tp-meta-tag--captain">
                    <Crown size={13} />
                    <span>Капитан: {captainPlayer.nickname}</span>
                  </span>
                )}
              </div>

              {/* Action Controls & Socials */}
              <div className="tp-socials-row">
                <button
                  type="button"
                  className={`pp-social-btn ${isFollowed ? 'pp-social-btn--active' : ''}`}
                  onClick={handleToggleFollow}
                >
                  <Bookmark size={13} />
                  <span>{isFollowed ? 'В избранном' : 'В избранное'}</span>
                </button>

                <button
                  type="button"
                  className="pp-social-btn"
                  onClick={handleCopyLink}
                  title="Скопировать ссылку на профиль команды"
                >
                  {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Скопировано' : 'Поделиться'}</span>
                </button>

                {team.twitterUrl && (
                  <a href={team.twitterUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn" title="Twitter / X">
                    <span>X</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {team.discordUrl && (
                  <a href={team.discordUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn" title="Discord">
                    <span>Discord</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {team.twitchUrl && (
                  <a href={team.twitchUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn" title="Twitch">
                    <span>Twitch</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {team.websiteUrl && (
                  <a href={team.websiteUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn" title="Веб-сайт">
                    <span>Сайт</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Highlight Stat Cards — matches pp-hero__stats-cards exactly */}
          <div className="pp-hero__stats-cards">
            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">РЕЙТИНГ ASCENT</span>
              <span className="pp-highlight-stat__value" style={{ color: 'var(--tier-t1)' }}>
                {team.rating}
              </span>
              <span className="pp-highlight-stat__sub">Топ-{team.worldRank} в лиге</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">ВИНРЕЙТ МАТЧЕЙ</span>
              <span className="pp-highlight-stat__value">
                {team.stats.winRate}%
              </span>
              <span className="pp-highlight-stat__sub">
                {team.stats.wins}В - {team.stats.losses}П
              </span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">СЕРИЯ / ФОРМА</span>
              <span
                className="pp-highlight-stat__value"
                style={{
                  color: team.stats.streak.startsWith('W') ? 'var(--accent-positive)' : 'var(--accent-negative)'
                }}
              >
                {team.stats.streak}
              </span>
              <div className="tp-form-dots-sub">
                {team.stats.recentForm.map((res, i) => (
                  <span
                    key={i}
                    className={`tp-form-dot ${res === 'W' ? 'w' : 'l'}`}
                    title={res === 'W' ? 'Победа' : 'Поражение'}
                  >
                    {res === 'W' ? 'В' : 'П'}
                  </span>
                ))}
              </div>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">ПРИЗОВЫЕ</span>
              <span className="pp-highlight-stat__value" style={{ color: 'var(--accent-positive)' }}>
                {team.totalEarnings || '$500,000'}
              </span>
              <span className="pp-highlight-stat__sub">за всю историю</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation — standard site .tabs-header and .tab-btn */}
        <div className="tabs-header tp-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} />
            <span>Обзор</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            <Users size={16} />
            <span>Состав ({team.roster.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Swords size={16} />
            <span>Матчи ({team.recentMatches.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Trophy size={16} />
            <span>Достижения ({team.achievements.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'mappool' ? 'active' : ''}`}
            onClick={() => setActiveTab('mappool')}
          >
            <Target size={16} />
            <span>Маппул ({team.mapStats.length})</span>
          </button>
        </div>

        {/* TAB 1: Обзор */}
        {activeTab === 'overview' && (
          <div className="tp-tab-content">
            {/* Tactical Metrics Grid */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <TrendingUp size={20} />
                <span>Тактические показатели CS2</span>
              </h3>

              <div className="pp-metrics-grid tp-metrics-grid">
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Пистолетные раунды</span>
                  <span className="pp-metric-val">{team.stats.pistolWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill" style={{ width: `${team.stats.pistolWinRate}%` }} />
                  </div>
                </div>

                <div className="pp-metric-card">
                  <span className="pp-metric-label">Победы за сторону CT</span>
                  <span className="pp-metric-val">{team.stats.ctWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill tp-progress-bar-fill--ct" style={{ width: `${team.stats.ctWinRate}%` }} />
                  </div>
                </div>

                <div className="pp-metric-card">
                  <span className="pp-metric-label">Победы за сторону T</span>
                  <span className="pp-metric-val">{team.stats.tWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill tp-progress-bar-fill--t" style={{ width: `${team.stats.tWinRate}%` }} />
                  </div>
                </div>

                <div className="pp-metric-card">
                  <span className="pp-metric-label">Овертаймы (MR3)</span>
                  <span className="pp-metric-val">{team.stats.overtimeWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill" style={{ width: `${team.stats.overtimeWinRate}%` }} />
                  </div>
                </div>

                <div className="pp-metric-card">
                  <span className="pp-metric-label">Первые дуэли (5v4)</span>
                  <span className="pp-metric-val">{team.stats.openingDuelWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill" style={{ width: `${team.stats.openingDuelWinRate}%` }} />
                  </div>
                </div>

                <div className="pp-metric-card">
                  <span className="pp-metric-label">Клатчи (1vX ситуации)</span>
                  <span className="pp-metric-val">{team.stats.clutchWinRate}%</span>
                  <div className="tp-progress-bar-bg">
                    <div className="tp-progress-bar-fill" style={{ width: `${team.stats.clutchWinRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Split 2-Column: Map Pool Preview & Roster Preview */}
            <div className="pp-grid-2col">
              {/* Map Win Rates */}
              <div className="panel pp-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Target size={20} />
                    <span>Топ карт в маппуле</span>
                  </h3>
                  <button type="button" className="tp-link-btn" onClick={() => setActiveTab('mappool')}>
                    <span>Весь маппул</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="pp-maps-list">
                  {team.mapStats.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="pp-map-item">
                      <div className="pp-map-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="pp-map-name">{m.mapName}</span>
                          {m.pickPriority === 'signature' && (
                            <span className="tp-priority-tag signature">Сильный пик</span>
                          )}
                          {m.pickPriority === 'comfort' && (
                            <span className="tp-priority-tag comfort">Комфортная</span>
                          )}
                          {m.pickPriority === 'permaban' && (
                            <span className="tp-priority-tag ban">Бан</span>
                          )}
                        </div>
                        <span className="pp-map-winrate">{m.winRate}%</span>
                      </div>

                      <div className="pp-progress-bar-bg">
                        <div
                          className="pp-progress-bar-fill pp-progress-bar-fill--map"
                          style={{ width: `${m.winRate}%` }}
                        />
                      </div>

                      <div className="pp-map-footer">
                        <span>Матчей: <strong>{m.matchesPlayed}</strong> ({m.wins}В - {m.losses}П)</span>
                        <span>Рейтинг: <strong>{m.rating.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starting 5 Preview */}
              <div className="panel pp-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Users size={20} />
                    <span>Основной состав</span>
                  </h3>
                  <button type="button" className="tp-link-btn" onClick={() => setActiveTab('roster')}>
                    <span>Все игроки</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="tp-roster-preview-list">
                  {team.roster.map((player, idx) => {
                    const playerSlug = player.nickname.toLowerCase();
                    const country = PLAYER_COUNTRIES[playerSlug] || 'ru';
                    const isHighRating = player.rating >= 1.25;

                    return (
                      <Link
                        key={idx}
                        to={`/players/${playerSlug}`}
                        className="tp-player-row-item hover-bg"
                        title={`Открыть профиль ${player.nickname}`}
                      >
                        <div className="tp-player-avatar-small">
                          {player.image ? (
                            <img src={player.image} alt={player.nickname} />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div className="tp-player-row-info">
                          <div className="tp-player-name-line">
                            <CountryFlag code={country} size="sm" />
                            <span className="tp-player-nick-text">{player.nickname}</span>
                            {player.isCaptain && (
                              <span title="Капитан команды" style={{ display: 'inline-flex' }}>
                                <Crown size={12} style={{ color: 'var(--tier-t1)' }} />
                              </span>
                            )}
                          </div>
                          <span className="tp-player-role-text">{player.role}</span>
                        </div>

                        <div className="tp-player-row-metrics">
                          <div className="tp-stat-chip">
                            <span className="label">ADR</span>
                            <span className="val">{player.adr}</span>
                          </div>
                          <div className="tp-stat-chip">
                            <span className="label">K/D</span>
                            <span className="val">{player.kd.toFixed(2)}</span>
                          </div>
                          <div className={`pp-rating-pill ${isHighRating ? 'positive' : 'neutral'}`}>
                            {player.rating.toFixed(2)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About / Bio Panel */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Shield size={20} />
                <span>О клубе {team.name}</span>
              </h3>
              <p className="text-secondary" style={{ lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                {team.bio}
              </p>
              <div className="tp-meta-row">
                <span className="pp-meta-tag">Основана: {team.founded} г.</span>
                <span className="pp-meta-tag">Регион: {team.region}</span>
                <span className="pp-meta-tag">Дивизион: {team.tier} PRO League</span>
                <span className="pp-meta-tag">Призовые: {team.totalEarnings || '$500,000'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Состав */}
        {activeTab === 'roster' && (
          <div className="tp-tab-content">
            {/* Active Starting Five */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Users size={20} />
                <span>Основной состав на турниры (Starting Five)</span>
              </h3>

              <div className="tp-roster-cards-grid">
                {team.roster.map((player, idx) => {
                  const playerSlug = player.nickname.toLowerCase();
                  const country = PLAYER_COUNTRIES[playerSlug] || 'ru';
                  const isHighRating = player.rating >= 1.25;

                  return (
                    <div key={idx} className="panel tp-player-card">
                      <div className="tp-player-card__top">
                        <span className="pp-meta-tag">{player.role}</span>
                        <CountryFlag code={country} size="sm" />
                      </div>

                      <div className="tp-player-card__avatar-box">
                        {player.image ? (
                          <img src={player.image} alt={player.nickname} className="tp-player-card__avatar-img" />
                        ) : (
                          <div className="tp-player-card__avatar-placeholder">
                            <User size={40} />
                          </div>
                        )}
                        <div className={`pp-rating-pill ${isHighRating ? 'positive' : 'neutral'} tp-player-card__rating`}>
                          {player.rating.toFixed(2)}
                        </div>
                      </div>

                      <div className="tp-player-card__names">
                        <h4 className="tp-player-card__nickname">{player.nickname}</h4>
                        {player.realName && (
                          <span className="tp-player-card__realname">{player.realName}</span>
                        )}
                      </div>

                      <div className="tp-player-card__stats-grid">
                        <div className="tp-pcard-stat">
                          <span className="label">ADR</span>
                          <span className="val">{player.adr}</span>
                        </div>
                        <div className="tp-pcard-stat">
                          <span className="label">K/D</span>
                          <span className="val">{player.kd.toFixed(2)}</span>
                        </div>
                        <div className="tp-pcard-stat">
                          <span className="label">KAST</span>
                          <span className="val">{player.kastPct}%</span>
                        </div>
                        <div className="tp-pcard-stat">
                          <span className="label">HS%</span>
                          <span className="val">{player.headshotPct}%</span>
                        </div>
                      </div>

                      <Link
                        to={`/players/${playerSlug}`}
                        className="btn-outline tp-player-card__btn"
                      >
                        <span>Профиль</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Staff / Management */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Shield size={20} />
                <span>Тренерский и тактический штаб</span>
              </h3>

              <div className="pp-peripherals-grid">
                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Shield size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Главный тренер (Head Coach)</span>
                    <span className="pp-peripheral-name">{team.coach}</span>
                    <span className="text-secondary text-xs" style={{ marginTop: '2px' }}>
                      Тактика, тайм-ауты и план на игру
                    </span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Activity size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Тактический аналитик</span>
                    <span className="pp-peripheral-name">{team.analyst}</span>
                    <span className="text-secondary text-xs" style={{ marginTop: '2px' }}>
                      Анализ демок, раскидки и сплиты
                    </span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Award size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Генеральный менеджер</span>
                    <span className="pp-peripheral-name">{team.manager}</span>
                    <span className="text-secondary text-xs" style={{ marginTop: '2px' }}>
                      Организация буткемпов и логистика
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: История матчей */}
        {activeTab === 'matches' && (
          <div className="tp-tab-content">
            <div className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <h3 className="pp-section-title" style={{ margin: 0 }}>
                  <Swords size={20} />
                  <span>История официальных матчей</span>
                </h3>

                {/* Match Filter Pills */}
                <div className="tp-filters-wrap">
                  <button
                    type="button"
                    className={`btn-outline tp-filter-btn ${matchFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setMatchFilter('all')}
                  >
                    Все ({team.recentMatches.length})
                  </button>
                  <button
                    type="button"
                    className={`btn-outline tp-filter-btn ${matchFilter === 'W' ? 'active' : ''}`}
                    onClick={() => setMatchFilter('W')}
                  >
                    Победы ({team.recentMatches.filter((m) => m.result === 'W').length})
                  </button>
                  <button
                    type="button"
                    className={`btn-outline tp-filter-btn ${matchFilter === 'L' ? 'active' : ''}`}
                    onClick={() => setMatchFilter('L')}
                  >
                    Поражения ({team.recentMatches.filter((m) => m.result === 'L').length})
                  </button>
                </div>
              </div>

              {filteredMatches.length > 0 ? (
                <div className="pp-matches-table-wrapper">
                  <table className="data-table pp-matches-table">
                    <thead>
                      <tr>
                        <th style={{ width: '90px' }}>Результат</th>
                        <th>Соперник</th>
                        <th>Турнир</th>
                        <th>Карты</th>
                        <th style={{ textAlign: 'center' }}>Счет</th>
                        <th>Формат</th>
                        <th style={{ textAlign: 'right' }}>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatches.map((match) => {
                        const isWin = match.result === 'W';
                        return (
                          <tr key={match.id}>
                            <td>
                              <span className={`pp-match-tag ${isWin ? 'W' : 'L'}`}>
                                {isWin ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/teams/${match.opponentSlug}`}
                                className="pp-opponent-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <TeamLogo name={match.opponent} size="sm" />
                                <span>{match.opponent}</span>
                              </Link>
                            </td>
                            <td>
                              <span className="text-secondary text-sm">{match.event}</span>
                            </td>
                            <td>
                              <span className="pp-map-pill">{match.map}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className="pp-match-score-cell"
                                style={{
                                  color: isWin ? 'var(--accent-positive)' : 'var(--accent-negative)'
                                }}
                              >
                                {match.score}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs">{match.format || 'Bo3'}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="text-secondary text-xs">{match.date}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <Swords size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
                  <p>В этой категории пока нет матчей</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Достижения */}
        {activeTab === 'achievements' && (
          <div className="tp-tab-content">
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Trophy size={20} />
                <span>Трофеи и титулы</span>
              </h3>

              <div className="tp-trophies-grid">
                {team.achievements.map((ach) => {
                  const isGold = ach.placement.includes('1');
                  const isSilver = ach.placement.includes('2');
                  const tierClass = isGold ? 'gold' : isSilver ? 'silver' : 'bronze';

                  return (
                    <div key={ach.id} className={`panel tp-trophy-card tp-trophy-card--${tierClass}`}>
                      <div className="tp-trophy-card__icon">
                        <Trophy size={28} />
                      </div>

                      <div className="tp-trophy-card__body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className={`tp-trophy-badge ${tierClass}`}>
                            {ach.placement}
                          </span>
                          <span className="text-tertiary text-xs">{ach.date}</span>
                        </div>

                        <h4 className="tp-trophy-title">{ach.title}</h4>
                        <p className="text-secondary text-sm">{ach.event}</p>

                        {ach.prize && (
                          <div className="tp-trophy-prize">
                            Призовые: <strong>{ach.prize}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Маппул */}
        {activeTab === 'mappool' && (
          <div className="tp-tab-content">
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Target size={20} />
                <span>Соревновательный маппул и статистика карт</span>
              </h3>

              <div className="tp-mappool-grid">
                {team.mapStats.map((m, idx) => {
                  const isSignature = m.winRate >= 70;
                  const isComfort = m.winRate >= 55 && m.winRate < 70;

                  return (
                    <div key={idx} className="panel tp-map-card">
                      <div className="tp-map-card__top">
                        <div>
                          <h4 className="tp-map-card__name">{m.mapName}</h4>
                          <span className="text-secondary text-xs">{m.matchesPlayed} матчей</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="tp-map-card__wr-val">{m.winRate}%</span>
                          <span className="text-tertiary text-xs" style={{ display: 'block' }}>Винрейт</span>
                        </div>
                      </div>

                      <div className="pp-progress-bar-bg" style={{ margin: 'var(--space-3) 0' }}>
                        <div
                          className="pp-progress-bar-fill pp-progress-bar-fill--map"
                          style={{
                            width: `${m.winRate}%`,
                            background: isSignature
                              ? 'linear-gradient(90deg, #10b981, #34d399)'
                              : isComfort
                              ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                              : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                          }}
                        />
                      </div>

                      {/* CT vs T side split bars */}
                      <div className="tp-map-sides-row">
                        <div className="tp-side-item">
                          <div className="tp-side-header">
                            <span className="text-secondary text-xs">Сторона CT</span>
                            <span className="text-primary text-xs font-semibold">{m.ctWinRate}%</span>
                          </div>
                          <div className="tp-mini-bar-bg">
                            <div className="tp-mini-bar-fill ct" style={{ width: `${m.ctWinRate}%` }} />
                          </div>
                        </div>

                        <div className="tp-side-item">
                          <div className="tp-side-header">
                            <span className="text-secondary text-xs">Сторона T</span>
                            <span className="text-primary text-xs font-semibold">{m.tWinRate}%</span>
                          </div>
                          <div className="tp-mini-bar-bg">
                            <div className="tp-mini-bar-fill t" style={{ width: `${m.tWinRate}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="tp-map-card__footer">
                        <div>
                          <span className="text-tertiary text-xs" style={{ display: 'block' }}>Баланс</span>
                          <span className="text-primary text-sm font-semibold">{m.wins}В - {m.losses}П</span>
                        </div>
                        <div>
                          <span className="text-tertiary text-xs" style={{ display: 'block' }}>Рейтинг</span>
                          <span className="text-primary text-sm font-semibold">{m.rating.toFixed(2)}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`tp-priority-tag ${isSignature ? 'signature' : isComfort ? 'comfort' : 'ban'}`}>
                            {isSignature ? 'Сильный пик' : isComfort ? 'Комфортная' : 'Пермабан'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamProfilePage;
