import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Users,
  User,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import TeamLogo from '../Teams/components/TeamLogo';
import TierBadge from '../Teams/components/TierBadge';
import AscentRatingBadge from '@/components/ui/RatingBadge/AscentRatingBadge';
import CountryFlag from '@/components/ui/CountryFlag/CountryFlag';
import { useData } from '@/context/DataContext';
import { players as mockPlayers, getPlayerProfile } from '@/data/mocks/playersMockData';
import { getKD, getKDDiff, getPlayerRating, type SortKey, type SortDirection, type PlayerStats, type TeamTier } from '@/types';
import '../Teams/TeamsPage.css';
import '../Players/PlayersPage.css';
import './StatsPage.css';

const tierOptions = [
  { value: 'all', label: 'All Tiers' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
];

function getSortValue(player: PlayerStats, key: SortKey): number {
  if (key === 'maps') return player.maps;
  if (key === 'rounds') return player.rounds;
  if (key === 'kdDiff') return getKDDiff(player);
  if (key === 'kd') return getKD(player);
  if (key === 'rating') return getPlayerRating(player);
  return 0;
}

interface StatsPageProps {
  defaultTab?: 'teams' | 'players';
}

const StatsPage: React.FC<StatsPageProps> = ({ defaultTab = 'teams' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab = urlTab === 'players' || urlTab === 'teams' ? urlTab : defaultTab;

  const [activeTab, setActiveTab] = useState<'teams' | 'players'>(initialTab);

  // Synchronize tab state with query params
  useEffect(() => {
    if (urlTab === 'players' || urlTab === 'teams') {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: 'teams' | 'players') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { teams, players: contextPlayers } = useData();
  const allPlayers = contextPlayers && contextPlayers.length > 0 ? contextPlayers : mockPlayers;

  // ── Teams State ──────────────────────────────────────────────────────────
  const [tier, setTier] = useState('all');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const teamRows = useMemo(() => {
    return [...teams]
      .sort((a, b) => b.rating - a.rating)
      .filter((t) => tier === 'all' || t.tier === (tier as TeamTier));
  }, [teams, tier]);

  const toggleExpanded = (slug: string) => {
    setExpandedSlug((current) => (current === slug ? null : slug));
  };

  // ── Players State ────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const handlePlayerSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const playerRows = useMemo(() => {
    const sorted = [...allPlayers].sort((a, b) => {
      const diff = getSortValue(a, sortKey) - getSortValue(b, sortKey);
      return sortDir === 'desc' ? -diff : diff;
    });
    return sorted;
  }, [allPlayers, sortKey, sortDir]);

  return (
    <section className="stats-page">
      <div className="container">
        {/* Unified Subnav Tabs */}
        <div className="stats-nav-tabs tabs-header">
          <button
            type="button"
            className={`tab-btn${activeTab === 'teams' ? ' active' : ''}`}
            onClick={() => handleTabChange('teams')}
          >
            <Shield size={16} />
            <span>Teams ({teams.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn${activeTab === 'players' ? ' active' : ''}`}
            onClick={() => handleTabChange('players')}
          >
            <Users size={16} />
            <span>Players ({allPlayers.length})</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: TEAMS RANKING                                                */}
        {/* =================================================================== */}
        {activeTab === 'teams' && (
          <div className="stats-teams-content">
            <div className="teams-filters">
              <CustomSelect value={tier} onChange={setTier} options={tierOptions} />
            </div>

            <div className="team-list">
              {teamRows.map((team, i) => {
                const isExpanded = expandedSlug === team.slug;
                const topClass = i === 0 ? 'team-row--first' : i === 1 ? 'team-row--second' : i === 2 ? 'team-row--third' : '';
                const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
                return (
                  <div key={team.slug} className="team-list__item">
                    <div
                      className={`team-row panel ${topClass}${isExpanded ? ' team-row--expanded' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpanded(team.slug)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleExpanded(team.slug);
                      }}
                    >
                      <span className={`team-row__rank ${rankClass}`}>#{i + 1}</span>
                      <TeamLogo name={team.name} size="lg" />
                      <div className="team-row__main">
                        <p className="team-row__name">
                          {team.name}{' '}
                          <span className="text-tertiary team-row__rating">
                            ({team.rating} ASCENT Rating)
                          </span>
                        </p>
                        <p className="text-secondary team-row__roster">
                          {team.roster.map((p) => p.nickname).join(' • ')}
                        </p>
                      </div>
                      <TierBadge tier={team.tier} />
                    </div>

                    {isExpanded && (
                      <div className="panel team-expanded">
                        <div className="team-expanded__grid">
                          {team.roster.map((player) => {
                            const playerSlug = player.nickname.toLowerCase();
                            const pProfile = getPlayerProfile(player.nickname, allPlayers);
                            const avatar = pProfile?.avatar || player.image;

                            return (
                              <Link
                                key={player.nickname}
                                to={`/players/${playerSlug}`}
                                className="team-expanded-player"
                                title={`View ${player.nickname}'s profile`}
                              >
                                <div className="team-expanded-player__photo-wrap">
                                  {avatar ? (
                                    <img
                                      src={avatar}
                                      alt={player.nickname}
                                      className="team-expanded-player__photo"
                                    />
                                  ) : (
                                    <div className="team-expanded-player__photo-placeholder">
                                      <User size={36} />
                                    </div>
                                  )}
                                </div>

                                <div className="team-expanded-player__meta">
                                  <CountryFlag code={playerSlug} size="sm" />
                                  <span className="team-expanded-player__nick">{player.nickname}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        <div className="team-expanded__footer">
                          <Link to={`/teams/${team.slug}`} className="team-expanded__footer-link">
                            <span>Team Profile</span>
                            <ArrowUpRight size={13} />
                          </Link>
                          <Link to={`/teams/${team.slug}?tab=matches`} className="team-expanded__footer-link">
                            <span>Ranking details</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {teamRows.length === 0 && (
                <p className="text-secondary team-list__empty">No teams found for the selected tier.</p>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PLAYERS TOP RANKING                                          */}
        {/* =================================================================== */}
        {activeTab === 'players' && (
          <div className="stats-players-content">

            <div className="hltv-table-wrap">
              <table className="hltv-table">
                <thead>
                  <tr>
                    <th className="hltv-th hltv-th--rank">#</th>
                    <th className="hltv-th hltv-th--player">Player</th>
                    <th className="hltv-th hltv-th--center hltv-th--team">Team</th>
                    <th
                      className={`hltv-th hltv-th--sortable hltv-th--center hltv-th--maps${sortKey === 'maps' ? ' hltv-th--active' : ''}`}
                      onClick={() => handlePlayerSort('maps')}
                    >
                      <span className="hltv-th__inner">
                        Maps
                        {sortKey === 'maps' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                    <th
                      className={`hltv-th hltv-th--sortable hltv-th--center hltv-th--rounds${sortKey === 'rounds' ? ' hltv-th--active' : ''}`}
                      onClick={() => handlePlayerSort('rounds')}
                    >
                      <span className="hltv-th__inner">
                        Rounds
                        {sortKey === 'rounds' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                    <th
                      className={`hltv-th hltv-th--sortable hltv-th--center hltv-th--diff${sortKey === 'kdDiff' ? ' hltv-th--active' : ''}`}
                      onClick={() => handlePlayerSort('kdDiff')}
                    >
                      <span className="hltv-th__inner">
                        K-D Diff
                        {sortKey === 'kdDiff' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                    <th
                      className={`hltv-th hltv-th--sortable hltv-th--center hltv-th--kd${sortKey === 'kd' ? ' hltv-th--active' : ''}`}
                      onClick={() => handlePlayerSort('kd')}
                    >
                      <span className="hltv-th__inner">
                        K/D
                        {sortKey === 'kd' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                    <th
                      className={`hltv-th hltv-th--sortable hltv-th--center hltv-th--rating${sortKey === 'rating' ? ' hltv-th--active' : ''}`}
                      onClick={() => handlePlayerSort('rating')}
                    >
                      <span className="hltv-th__inner">
                        ASCENT Rating
                        {sortKey === 'rating' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {playerRows.map((player, i) => {
                    const kd = getKD(player);
                    const kdDiff = getKDDiff(player);
                    const rating = getPlayerRating(player);
                    const playerSlug = player.nickname.toLowerCase();
                    const teamSlug = player.team.toLowerCase().replace(/\s+/g, '-');
                    const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
                    const topRowClass = i === 0 ? 'hltv-row--first' : i === 1 ? 'hltv-row--second' : i === 2 ? 'hltv-row--third' : '';

                    return (
                      <tr key={player.id} className={`hltv-row ${topRowClass}`}>
                        <td className={`hltv-cell hltv-cell--rank ${rankClass}`}>
                          #{i + 1}
                        </td>
                        <td className="hltv-cell hltv-cell--player">
                          <Link to={`/players/${playerSlug}`} className="hltv-player-link">
                            <CountryFlag code={playerSlug} size="md" className="hltv-player-flag" />
                            <span className="hltv-player-name">{player.nickname}</span>
                          </Link>
                        </td>
                        <td className="hltv-cell hltv-cell--center hltv-cell--team">
                          <Link to={`/teams/${teamSlug}`} className="hltv-team-link" title={player.team}>
                            <TeamLogo name={player.team} size="lg" />
                          </Link>
                        </td>
                        <td className="hltv-cell hltv-cell--center hltv-cell--maps">{player.maps}</td>
                        <td className="hltv-cell hltv-cell--center hltv-cell--rounds">{player.rounds}</td>
                        <td className={`hltv-cell hltv-cell--center hltv-cell--diff font-bold ${kdDiff > 0 ? 'hltv-diff--pos' : kdDiff < 0 ? 'hltv-diff--neg' : 'hltv-diff--zero'}`}>
                          {kdDiff > 0 ? `+${kdDiff}` : kdDiff}
                        </td>
                        <td className="hltv-cell hltv-cell--center hltv-cell--kd font-bold">
                          {kd.toFixed(2)}
                        </td>
                        <td className="hltv-cell hltv-cell--center hltv-cell--rating">
                          <AscentRatingBadge rating={rating} size="md" />
                        </td>
                      </tr>
                    );
                  })}

                  {playerRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="hltv-empty">
                        No players found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsPage;
