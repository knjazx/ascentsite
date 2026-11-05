import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Swords,
  Trophy,
  Target,
  TrendingUp,
  Activity,
  Award,
  Sliders,
  Copy,
  Check,
  Crosshair,
  ExternalLink,
  Shield,
  MousePointer,
  Monitor,
  Headphones,
  Keyboard,
  User,
  Clock,
  Sparkles,
  Terminal,
  Layers
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { getPlayerProfile } from '@/data/mocks/playersMockData';
import { getKDDiff, getKD, getPlayerRating, type PlayerProfile } from '@/types';
import AscentRatingBadge from '@/components/ui/RatingBadge/AscentRatingBadge';
import TeamBadge from './components/TeamBadge';
import CountryFlag from '@/components/ui/CountryFlag/CountryFlag';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import './PlayerProfilePage.css';

type Tab = 'overview' | 'achievements' | 'gear';

const PlayerProfilePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { players: dynamicPlayers, currentUser } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedCrosshair, setCopiedCrosshair] = useState(false);
  const [copiedLaunch, setCopiedLaunch] = useState(false);
  const { showToast } = useToast();

  const isOwner = Boolean(
    currentUser &&
      (slug.toLowerCase() === 'me' ||
        slug.toLowerCase() === currentUser.nickname?.toLowerCase() ||
        (currentUser.id && slug.toLowerCase() === currentUser.id.toLowerCase()))
  );

  // Retrieve player profile from mock / dynamic context
  const mockPlayer = getPlayerProfile(slug, dynamicPlayers);

  // If player not in mock data, but matches current user, synthesize complete profile
  let activePlayer: PlayerProfile | undefined = mockPlayer ?? undefined;

  if (!activePlayer && (isOwner || slug.toLowerCase() === 'me') && currentUser) {
    const sens = currentUser.sensitivity || 1.15;
    const dpi = currentUser.dpi || 800;
    const eDpi = Math.round(sens * dpi);

    activePlayer = {
      id: currentUser.id,
      slug: currentUser.nickname?.toLowerCase() || 'me',
      nickname: currentUser.nickname,
      realName: currentUser.realName || 'Alexey Morozov',
      avatar: currentUser.avatar,
      team: currentUser.teamName || 'Free Agent',
      role: currentUser.gameRole || 'Rifler',
      country: currentUser.country || 'KZ',
      age: currentUser.age || 21,
      maps: 26,
      rounds: 588,
      kills: 512,
      deaths: 374,
      ratingAscent: 1.37,
      ratingEfl: 1.37,
      adr: 86.4,
      kastPct: 76.5,
      headshotPct: 58.2,
      impactRating: 1.32,
      clutchSuccessPct: 68,
      isSteamVerified: currentUser.isSteamVerified ?? true,
      steamId: currentUser.steamId || '76561198012345678',
      steamUrl: currentUser.steamUrl || (currentUser.steamId ? `https://steamcommunity.com/profiles/${currentUser.steamId}` : undefined),
      tradeUrl: currentUser.tradeUrl,
      faceitUrl: currentUser.faceitUrl || 'https://faceit.com/en/players/blazemaster',
      faceitLevel: currentUser.faceitLevel || 10,
      faceitElo: currentUser.faceitElo || 2540,
      twitchUrl: currentUser.twitchUrl,
      twitterUrl: currentUser.twitterUrl,
      discordHandle: currentUser.discordTag,
      telegramUrl: currentUser.telegramUrl,
      bio: currentUser.bio || 'Соревновательный игрок ASCENT CS2 League. Специализация: Rifler / Entry Fragger.',
      favoriteWeapon: currentUser.favoriteWeapon || 'AK-47',
      favoriteMap: currentUser.favoriteMap || 'Mirage',
      playerStatus: currentUser.playerStatus || 'active',
      gear: {
        mouse: currentUser.mouse || 'Logitech G Pro X Superlight 2',
        mousepad: currentUser.mousepad || 'Artisan Ninja FX Zero XSoft',
        keyboard: currentUser.keyboard || 'Wooting 60HE (Rapid Trigger)',
        headset: currentUser.headset || 'HyperX Cloud III Wireless',
        monitor: currentUser.monitor || 'ZOWIE XL2566K (360Hz DyAc+)',
        dpi: dpi,
        sensitivity: sens,
        eDpi: eDpi,
        hz: currentUser.hz || 1000,
        zoomSensitivity: currentUser.zoomSensitivity || 1.0,
        crosshairCode: currentUser.crosshairCode || 'CSGO-m4vW6-8Z3Zk-bB8vV-mF67p-bV7eE',
        resolution: currentUser.resolution || '1280x960',
        aspectRatio: currentUser.aspectRatio || '4:3',
        scalingMode: currentUser.scalingMode || 'Stretched',
        launchOptions: currentUser.launchOptions || '-novid -tickrate 128 +fps_max 0 -freq 360'
      },
      topWeapons: [
        { weapon: currentUser.favoriteWeapon || 'AK-47', kills: 278, percentage: 54, headshotPct: 64 },
        { weapon: 'M4A1-S', kills: 146, percentage: 29, headshotPct: 56 },
        { weapon: 'Desert Eagle', kills: 52, percentage: 10, headshotPct: 76 },
        { weapon: 'AWP', kills: 36, percentage: 7, headshotPct: 22 }
      ],
      mapStats: [
        { mapName: currentUser.favoriteMap || 'Mirage', winRate: 70, matchesPlayed: 14, kd: 1.41, rating: 1.44 },
        { mapName: 'Inferno', winRate: 64, matchesPlayed: 11, kd: 1.25, rating: 1.29 },
        { mapName: 'Nuke', winRate: 50, matchesPlayed: 8, kd: 1.14, rating: 1.16 },
        { mapName: 'Ancient', winRate: 60, matchesPlayed: 5, kd: 1.30, rating: 1.32 }
      ],
      achievements: [
        {
          id: 'ach-1',
          title: 'ASCENT League Season 4 - Main Division Contender',
          event: 'ASCENT CS2 League',
          date: '2026',
          type: 'gold',
          description: 'Успешная квалификация в основную соревновательную сетку лиги.'
        },
        {
          id: 'ach-2',
          title: 'Verified Steam & FACEIT Competitor',
          event: 'Player Verification System',
          date: '2026',
          type: 'mvp',
          description: 'Официальный подтвержденный статус через Steam OpenID и FACEIT Level 10.'
        }
      ],
      recentMatches: [
        {
          id: 'm-1',
          opponent: 'PARIVISION',
          opponentSlug: 'parivision',
          date: '2026-11-02',
          event: 'ASCENT League Season 4',
          map: 'Mirage',
          result: 'W',
          score: '13:9',
          kills: 24,
          deaths: 13,
          adr: 98.4,
          rating: 1.52,
          isMvp: true
        },
        {
          id: 'm-2',
          opponent: 'Aurora',
          opponentSlug: 'aurora',
          date: '2026-10-29',
          event: 'ASCENT League Season 4',
          map: 'Inferno',
          result: 'W',
          score: '13:11',
          kills: 21,
          deaths: 16,
          adr: 88.2,
          rating: 1.28
        },
        {
          id: 'm-3',
          opponent: 'Nemiga',
          opponentSlug: 'nemiga',
          date: '2026-10-25',
          event: 'ASCENT League Season 4',
          map: 'Ancient',
          result: 'L',
          score: '10:13',
          kills: 19,
          deaths: 17,
          adr: 82.0,
          rating: 1.10
        }
      ],
      careerHistory: [
        {
          teamName: currentUser.teamName || 'Free Agent',
          teamSlug: currentUser.teamSlug || (currentUser.teamName ? currentUser.teamName.toLowerCase().replace(/\s+/g, '-') : undefined),
          period: '2026 - Present',
          role: currentUser.gameRole || 'Starter'
        },
        {
          teamName: 'ASCENT Talent Academy',
          period: '2025 - 2026',
          role: 'Entry Fragger'
        }
      ]
    };
  } else if (activePlayer && isOwner && currentUser) {
    // Merge user's customized parameters over mock player
    const sens = currentUser.sensitivity || activePlayer.gear?.sensitivity || 1.15;
    const dpi = currentUser.dpi || activePlayer.gear?.dpi || 800;
    const computedEDpi = Math.round(sens * dpi);

    activePlayer = {
      ...activePlayer,
      avatar: currentUser.avatar || activePlayer.avatar,
      nickname: currentUser.nickname || activePlayer.nickname,
      realName: currentUser.realName || activePlayer.realName,
      role: currentUser.gameRole || activePlayer.role,
      country: currentUser.country || activePlayer.country,
      bio: currentUser.bio || activePlayer.bio,
      steamUrl: currentUser.steamUrl || activePlayer.steamUrl,
      steamId: currentUser.steamId || activePlayer.steamId,
      tradeUrl: currentUser.tradeUrl || activePlayer.tradeUrl,
      faceitUrl: currentUser.faceitUrl || activePlayer.faceitUrl,
      faceitElo: currentUser.faceitElo || activePlayer.faceitElo,
      faceitLevel: currentUser.faceitLevel || activePlayer.faceitLevel,
      isSteamVerified: currentUser.isSteamVerified !== undefined ? currentUser.isSteamVerified : activePlayer.isSteamVerified,
      favoriteWeapon: currentUser.favoriteWeapon || activePlayer.favoriteWeapon,
      favoriteMap: currentUser.favoriteMap || activePlayer.favoriteMap,
      gear: {
        ...activePlayer.gear,
        mouse: currentUser.mouse || activePlayer.gear?.mouse,
        mousepad: currentUser.mousepad || activePlayer.gear?.mousepad,
        keyboard: currentUser.keyboard || activePlayer.gear?.keyboard,
        headset: currentUser.headset || activePlayer.gear?.headset,
        monitor: currentUser.monitor || activePlayer.gear?.monitor,
        dpi: currentUser.dpi || activePlayer.gear?.dpi,
        sensitivity: currentUser.sensitivity || activePlayer.gear?.sensitivity,
        eDpi: computedEDpi || activePlayer.gear?.eDpi,
        hz: currentUser.hz || activePlayer.gear?.hz,
        zoomSensitivity: currentUser.zoomSensitivity || activePlayer.gear?.zoomSensitivity,
        crosshairCode: currentUser.crosshairCode || activePlayer.gear?.crosshairCode,
        resolution: currentUser.resolution || activePlayer.gear?.resolution,
        aspectRatio: currentUser.aspectRatio || activePlayer.gear?.aspectRatio,
        scalingMode: currentUser.scalingMode || activePlayer.gear?.scalingMode,
        launchOptions: currentUser.launchOptions || activePlayer.gear?.launchOptions
      }
    };
  }

  if (!activePlayer) {
    return (
      <section className="player-profile-page">
        <div className="container">
          <div className="panel pp-not-found">
            <h2>Player not found</h2>
            <p className="text-secondary">
              We couldn't find a player profile for "{slug}". Please check the nickname or return to the players list.
            </p>
            <div className="pp-not-found-actions">
              <Link to="/stats?tab=players" className="btn-primary">
                Back to Leaderboard
              </Link>
              {currentUser && (
                <Link to="/profile" className="btn-secondary">
                  Go to My Profile Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const kdRatio = getKD(activePlayer).toFixed(2);
  const kdDiff = getKDDiff(activePlayer);
  const teamSlug = activePlayer.team.toLowerCase().replace(/\s+/g, '-');

  const handleCopyCrosshair = () => {
    if (activePlayer?.gear?.crosshairCode) {
      navigator.clipboard.writeText(activePlayer.gear.crosshairCode);
      setCopiedCrosshair(true);
      showToast('CS2 Crosshair code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCrosshair(false), 2500);
    }
  };

  const handleCopyLaunch = () => {
    if (activePlayer?.gear?.launchOptions) {
      navigator.clipboard.writeText(activePlayer.gear.launchOptions);
      setCopiedLaunch(true);
      showToast('Параметры запуска CS2 скопированы!', 'success');
      setTimeout(() => setCopiedLaunch(false), 2500);
    }
  };

  return (
    <section className="player-profile-page">
      <div className="container">
        {/* Owner Quick Banner */}
        {isOwner && (
          <div className="panel pp-owner-banner">
            <div className="pp-owner-banner__left">
              <div className="pp-owner-badge">
                <Sparkles size={16} />
                <span>Ваш соревновательный профиль</span>
              </div>
              <p className="pp-owner-text">
                Вы просматриваете свой публичный профиль игрока. Все параметры, девайсы, прицел и социальные сети настраиваются в личном кабинете.
              </p>
            </div>
            <div className="pp-owner-banner__actions">
              <Link to="/profile" className="btn-primary pp-owner-edit-btn">
                <Sliders size={16} />
                Настроить параметры профиля
              </Link>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="panel pp-hero">
          <div className="pp-hero__left">
            <div className="pp-avatar-wrapper">
              {activePlayer.avatar ? (
                <img src={activePlayer.avatar} alt={activePlayer.nickname} className="pp-avatar-img" />
              ) : (
                <div className="pp-avatar-placeholder">
                  <User size={48} />
                </div>
              )}
            </div>

            <div className="pp-hero__identity">
              <div className="pp-hero__name-row">
                <CountryFlag code={activePlayer.country || activePlayer.slug || slug} size="md" />
                <h1 className="pp-nickname">{activePlayer.nickname}</h1>
                <Link to={`/teams/${teamSlug}`} className="pp-team-link" title={`View ${activePlayer.team}`}>
                  <TeamBadge name={activePlayer.team} />
                </Link>
                {activePlayer.isSteamVerified && (
                  <span className="pp-steam-verified-tag" title="Steam аккаунт верифицирован (VAC Clean)">
                    <SteamIcon size={14} />
                    <span>Steam Verified</span>
                  </span>
                )}
                {activePlayer.faceitLevel && (
                  <span className="pp-faceit-lvl-tag" title={`FACEIT Level ${activePlayer.faceitLevel}`}>
                    <span>LVL {activePlayer.faceitLevel}</span>
                    {activePlayer.faceitElo && <small>({activePlayer.faceitElo})</small>}
                  </span>
                )}
              </div>

              <div className="pp-meta-row">
                {activePlayer.realName && (
                  <span className="pp-meta-tag">
                    <User size={13} />
                    {activePlayer.realName}
                  </span>
                )}
                {activePlayer.age && (
                  <span className="pp-meta-tag">
                    <Clock size={13} />
                    {activePlayer.age} y/o
                  </span>
                )}
                {activePlayer.role && (
                  <span className="pp-meta-tag pp-meta-tag--role">
                    <Shield size={13} />
                    {activePlayer.role}
                  </span>
                )}
                {activePlayer.favoriteWeapon && (
                  <span className="pp-meta-tag pp-meta-tag--weapon">
                    <Crosshair size={13} />
                    {activePlayer.favoriteWeapon}
                  </span>
                )}
                {activePlayer.favoriteMap && (
                  <span className="pp-meta-tag pp-meta-tag--map">
                    <Target size={13} />
                    {activePlayer.favoriteMap}
                  </span>
                )}
              </div>

              {/* Social / Game Links */}
              <div className="pp-socials-row">
                {activePlayer.steamUrl && (
                  <a href={activePlayer.steamUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn pp-social-btn--steam" title="Steam Profile">
                    <SteamIcon size={14} />
                    <span>Steam</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {activePlayer.faceitUrl && (
                  <a href={activePlayer.faceitUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn pp-social-btn--faceit" title="FACEIT Profile">
                    <span>FACEIT</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {activePlayer.twitchUrl && (
                  <a href={activePlayer.twitchUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn pp-social-btn--twitch" title="Twitch Stream">
                    <span>Twitch</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {activePlayer.twitterUrl && (
                  <a href={activePlayer.twitterUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn" title="Twitter / X">
                    <span>X</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {activePlayer.telegramUrl && (
                  <a href={activePlayer.telegramUrl} target="_blank" rel="noopener noreferrer" className="pp-social-btn pp-social-btn--tg" title="Telegram">
                    <span>Telegram</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Highlight Stat Cards */}
          <div className="pp-hero__stats-cards">
            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">ASCENT Rating</span>
              <div style={{ margin: '4px 0 2px' }}>
                <AscentRatingBadge
                  rating={getPlayerRating(activePlayer)}
                  size="lg"
                />
              </div>
              <span className="pp-highlight-stat__sub">all matches</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">K/D Ratio</span>
              <span className="pp-highlight-stat__value">
                {kdRatio}
              </span>
              <span className="pp-highlight-stat__sub">
                {kdDiff >= 0 ? `+${kdDiff}` : kdDiff} K-D
              </span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">ADR</span>
              <span className="pp-highlight-stat__value">
                {activePlayer.adr || 82}
              </span>
              <span className="pp-highlight-stat__sub">dmg / round</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">Headshot %</span>
              <span className="pp-highlight-stat__value">
                {activePlayer.headshotPct ? `${activePlayer.headshotPct}%` : '48.5%'}
              </span>
              <span className="pp-highlight-stat__sub">hs rate</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-header pp-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            Overview & Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Trophy size={18} />
            Achievements & Career
          </button>
          <button
            className={`tab-btn ${activeTab === 'gear' ? 'active' : ''}`}
            onClick={() => setActiveTab('gear')}
          >
            <Sliders size={18} />
            Settings & CS2 Config
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="pp-tab-content">
            {/* Overview Key Metrics Grid */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <TrendingUp size={20} />
                Performance Metrics
              </h3>
              <div className="pp-metrics-grid">
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Maps Played</span>
                  <span className="pp-metric-val">{activePlayer.maps}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Rounds Played</span>
                  <span className="pp-metric-val">{activePlayer.rounds}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Total Kills</span>
                  <span className="pp-metric-val">{activePlayer.kills}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Total Deaths</span>
                  <span className="pp-metric-val">{activePlayer.deaths}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">KAST %</span>
                  <span className="pp-metric-val">{activePlayer.kastPct || 74.2}%</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Impact Rating</span>
                  <span className="pp-metric-val">{activePlayer.impactRating || 1.28}</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">Clutch Success</span>
                  <span className="pp-metric-val">{activePlayer.clutchSuccessPct || 65}%</span>
                </div>
                <div className="pp-metric-card">
                  <span className="pp-metric-label">K-D Difference</span>
                  <span className="pp-metric-val">
                    {kdDiff >= 0 ? `+${kdDiff}` : kdDiff}
                  </span>
                </div>
              </div>
            </div>

            {/* Split row: Weapons & Maps */}
            <div className="pp-grid-2col">
              {/* Top Weapons */}
              <div className="panel pp-section">
                <h3 className="pp-section-title">
                  <Crosshair size={20} />
                  Signature Weapons
                </h3>
                {activePlayer.topWeapons && activePlayer.topWeapons.length > 0 ? (
                  <div className="pp-weapons-list">
                    {activePlayer.topWeapons.map((w, idx) => (
                      <div key={idx} className="pp-weapon-item">
                        <div className="pp-weapon-header">
                          <span className="pp-weapon-name">{w.weapon}</span>
                          <span className="pp-weapon-kills">{w.kills} kills ({w.percentage}%)</span>
                        </div>
                        <div className="pp-progress-bar-bg">
                          <div className="pp-progress-bar-fill" style={{ width: `${w.percentage}%` }} />
                        </div>
                        <div className="pp-weapon-footer">
                          <span>HS Rate: <strong>{w.headshotPct}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary">No weapon statistics recorded yet.</p>
                )}
              </div>

              {/* Best Maps */}
              <div className="panel pp-section">
                <h3 className="pp-section-title">
                  <Target size={20} />
                  Map Win Rates & Rating
                </h3>
                {activePlayer.mapStats && activePlayer.mapStats.length > 0 ? (
                  <div className="pp-maps-list">
                    {activePlayer.mapStats.map((m, idx) => (
                      <div key={idx} className="pp-map-item">
                        <div className="pp-map-header">
                          <span className="pp-map-name">{m.mapName}</span>
                          <span className="pp-map-winrate">{m.winRate}% Win</span>
                        </div>
                        <div className="pp-progress-bar-bg">
                          <div
                            className="pp-progress-bar-fill pp-progress-bar-fill--map"
                            style={{ width: `${m.winRate}%` }}
                          />
                        </div>
                        <div className="pp-map-footer">
                          <span>{m.matchesPlayed} matches</span>
                          <span>Rating: <strong>{m.rating.toFixed(2)}</strong></span>
                          <span>K/D: <strong>{m.kd.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary">No map statistics recorded yet.</p>
                )}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Swords size={20} />
                Recent Match Performances
              </h3>
              {activePlayer.recentMatches && activePlayer.recentMatches.length > 0 ? (
                <div className="pp-matches-table-wrapper">
                  <table className="data-table pp-matches-table">
                    <thead>
                      <tr>
                        <th>Result</th>
                        <th>Event</th>
                        <th>Opponent</th>
                        <th>Map</th>
                        <th>Score</th>
                        <th>K - D</th>
                        <th>ADR</th>
                        <th>Rating 2.0</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePlayer.recentMatches.map((match) => (
                        <tr key={match.id}>
                          <td>
                            <span className={`pp-match-tag ${match.result}`}>
                              {match.result}
                            </span>
                          </td>
                          <td className="text-secondary">{match.event}</td>
                          <td>
                            <Link
                              to={`/teams/${match.opponentSlug || match.opponent.toLowerCase().replace(/\s+/g, '-')}`}
                              className="pp-opponent-link"
                            >
                              <span className="pp-vs-text">vs</span> {match.opponent}
                            </Link>
                          </td>
                          <td>
                            <span className="pp-map-pill">{match.map}</span>
                          </td>
                          <td className="pp-match-score-cell">{match.score}</td>
                          <td>
                            <strong>{match.kills}</strong> - <span className="text-secondary">{match.deaths}</span>
                          </td>
                          <td>{match.adr}</td>
                          <td>
                            <div className="pp-rating-cell">
                              <span className={`pp-rating-pill ${match.rating >= 1.2 ? 'positive' : match.rating >= 1.0 ? 'neutral' : 'negative'}`}>
                                {match.rating.toFixed(2)}
                              </span>
                              {match.isMvp && (
                                <span className="pp-mvp-badge" title="Match MVP">
                                  <Sparkles size={13} color="var(--tier-t1)" /> MVP
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary" style={{ padding: 'var(--space-4)' }}>
                  No recent match logs recorded yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Achievements & Career */}
        {activeTab === 'achievements' && (
          <div className="pp-tab-content">
            {/* Bio */}
            {activePlayer.bio && (
              <div className="panel pp-section">
                <h3 className="pp-section-title">
                  <User size={20} />
                  Player Biography
                </h3>
                <p className="pp-bio-text">{activePlayer.bio}</p>
              </div>
            )}

            {/* Achievements Showcase */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Trophy size={20} />
                Trophies & Honors
              </h3>
              {activePlayer.achievements && activePlayer.achievements.length > 0 ? (
                <div className="pp-achievements-grid">
                  {activePlayer.achievements.map((ach) => (
                    <div key={ach.id} className={`pp-achievement-card pp-achievement-card--${ach.type}`}>
                      <div className="pp-achievement-icon">
                        {ach.type === 'mvp' ? (
                          <Sparkles size={26} color="var(--tier-t1)" />
                        ) : ach.type === 'gold' ? (
                          <Trophy size={26} color="#ffd700" />
                        ) : ach.type === 'silver' ? (
                          <Award size={26} color="#e0e0e0" />
                        ) : (
                          <Award size={26} color="var(--accent-neutral)" />
                        )}
                      </div>
                      <div className="pp-achievement-info">
                        <h4 className="pp-achievement-title">{ach.title}</h4>
                        <p className="pp-achievement-event">{ach.event} • <span className="text-secondary">{ach.date}</span></p>
                        {ach.description && <p className="pp-achievement-desc">{ach.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary" style={{ padding: 'var(--space-4)' }}>
                  No recorded tournament achievements yet.
                </p>
              )}
            </div>

            {/* Career History */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Shield size={20} />
                Career History
              </h3>
              {activePlayer.careerHistory && activePlayer.careerHistory.length > 0 ? (
                <div className="pp-career-timeline">
                  {activePlayer.careerHistory.map((item, idx) => (
                    <div key={idx} className="pp-career-item">
                      <div className="pp-career-bullet" />
                      <div className="pp-career-content">
                        <div className="pp-career-header">
                          {item.teamSlug ? (
                            <Link to={`/teams/${item.teamSlug}`} className="pp-career-team">
                              {item.teamName}
                            </Link>
                          ) : (
                            <span className="pp-career-team">{item.teamName}</span>
                          )}
                          <span className="pp-career-period">{item.period}</span>
                        </div>
                        <p className="pp-career-role text-secondary">{item.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary" style={{ padding: 'var(--space-4)' }}>
                  Currently competing with <strong>{activePlayer.team}</strong>.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Settings & CS2 Config */}
        {activeTab === 'gear' && (
          <div className="pp-tab-content">
            {/* Crosshair Code Box with visual preview */}
            {activePlayer.gear?.crosshairCode && (
              <div className="panel pp-section pp-crosshair-section">
                <div className="pp-crosshair-header">
                  <div>
                    <h3 className="pp-section-title" style={{ margin: 0 }}>
                      <Crosshair size={20} />
                      CS2 Crosshair Code
                    </h3>
                    <p className="text-secondary text-sm mt-1">
                      Скопируйте и вставьте в настройки Counter-Strike 2 («Настройки» → «Игра» → «Прицел» → «Поделиться / Импорт»).
                    </p>
                  </div>
                  <button
                    className={`btn-primary pp-copy-btn ${copiedCrosshair ? 'pp-copy-btn--copied' : ''}`}
                    onClick={handleCopyCrosshair}
                  >
                    {copiedCrosshair ? (
                      <>
                        <Check size={16} />
                        Код скопирован!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Скопировать прицел
                      </>
                    )}
                  </button>
                </div>

                <div className="pp-crosshair-preview-wrapper">
                  <div className="pp-crosshair-canvas">
                    {/* Visual CS2 Crosshair Graphic */}
                    <div className="pp-crosshair-lines">
                      <div className="pp-ch-bar pp-ch-top" />
                      <div className="pp-ch-bar pp-ch-bottom" />
                      <div className="pp-ch-bar pp-ch-left" />
                      <div className="pp-ch-bar pp-ch-right" />
                      <div className="pp-ch-center-dot" />
                    </div>
                    <span className="pp-crosshair-tag">CS2 In-Game Simulation</span>
                  </div>
                  <div className="pp-crosshair-box">
                    <span className="pp-crosshair-code-label">Console / Settings Code</span>
                    <code>{activePlayer.gear.crosshairCode}</code>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Options Box if present */}
            {activePlayer.gear?.launchOptions && (
              <div className="panel pp-section pp-launch-section">
                <div className="pp-launch-header">
                  <div>
                    <h3 className="pp-section-title" style={{ margin: 0 }}>
                      <Terminal size={18} />
                      Параметры запуска Steam (Launch Options)
                    </h3>
                    <p className="text-secondary text-sm mt-1">
                      Оптимальные параметры для соревновательного запуска Counter-Strike 2.
                    </p>
                  </div>
                  <button
                    className={`btn-secondary pp-copy-btn ${copiedLaunch ? 'pp-copy-btn--copied' : ''}`}
                    onClick={handleCopyLaunch}
                  >
                    {copiedLaunch ? (
                      <>
                        <Check size={16} />
                        Скопировано!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Скопировать параметры
                      </>
                    )}
                  </button>
                </div>
                <div className="pp-launch-code-box">
                  <code>{activePlayer.gear.launchOptions}</code>
                </div>
              </div>
            )}

            {/* Mouse & Video Settings Grid */}
            <div className="pp-grid-2col">
              {/* Mouse Settings */}
              <div className="panel pp-section">
                <h3 className="pp-section-title">
                  <MousePointer size={20} />
                  Mouse & Sensitivity
                </h3>
                <div className="pp-gear-grid">
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">DPI</span>
                    <span className="pp-gear-val">{activePlayer.gear?.dpi || 800}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Sensitivity</span>
                    <span className="pp-gear-val">{activePlayer.gear?.sensitivity || 1.2}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">eDPI</span>
                    <span className="pp-gear-val text-positive">{activePlayer.gear?.eDpi || 960}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Polling Rate</span>
                    <span className="pp-gear-val">{activePlayer.gear?.hz ? `${activePlayer.gear.hz} Hz` : '1000 Hz'}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Zoom Sensitivity</span>
                    <span className="pp-gear-val">{activePlayer.gear?.zoomSensitivity || 1.0}</span>
                  </div>
                </div>
              </div>

              {/* Video / Display Settings */}
              <div className="panel pp-section">
                <h3 className="pp-section-title">
                  <Monitor size={20} />
                  Video & Display
                </h3>
                <div className="pp-gear-grid">
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Resolution</span>
                    <span className="pp-gear-val">{activePlayer.gear?.resolution || '1280x960'}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Aspect Ratio</span>
                    <span className="pp-gear-val">{activePlayer.gear?.aspectRatio || '4:3'}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Scaling Mode</span>
                    <span className="pp-gear-val">{activePlayer.gear?.scalingMode || 'Stretched'}</span>
                  </div>
                  <div className="pp-gear-item">
                    <span className="pp-gear-label">Refresh Rate</span>
                    <span className="pp-gear-val text-positive">240Hz+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Setup */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Sliders size={20} />
                Hardware & Peripherals Setup
              </h3>
              <div className="pp-peripherals-grid">
                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <MousePointer size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Mouse</span>
                    <span className="pp-peripheral-name">{activePlayer.gear?.mouse || 'Logitech G Pro X Superlight 2'}</span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Layers size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Mousepad</span>
                    <span className="pp-peripheral-name">{activePlayer.gear?.mousepad || 'Artisan Ninja FX Zero XSoft'}</span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Keyboard size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Keyboard</span>
                    <span className="pp-peripheral-name">{activePlayer.gear?.keyboard || 'Wooting 60HE (Analog Switches)'}</span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Headphones size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Headset</span>
                    <span className="pp-peripheral-name">{activePlayer.gear?.headset || 'HyperX Cloud II Wireless'}</span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Monitor size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Monitor</span>
                    <span className="pp-peripheral-name">{activePlayer.gear?.monitor || 'ZOWIE XL2566K (360Hz DyAc+)'}</span>
                  </div>
                </div>

                <div className="pp-peripheral-card">
                  <div className="pp-peripheral-icon">
                    <Crosshair size={24} />
                  </div>
                  <div className="pp-peripheral-info">
                    <span className="pp-peripheral-category">Favorite Weapon</span>
                    <span className="pp-peripheral-name">{activePlayer.favoriteWeapon || 'AK-47'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerProfilePage;
