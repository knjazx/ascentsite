import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ArrowUpRight } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import TierBadge from './components/TierBadge';
import TeamLogo from './components/TeamLogo';
import CountryFlag from '@/components/ui/CountryFlag/CountryFlag';
import { useData } from '@/context/DataContext';
import { players as mockPlayers, getPlayerProfile } from '@/data/mocks/playersMockData';
import type { TeamTier } from '@/types';
import './TeamsPage.css';

const tierOptions = [
  { value: 'all', label: 'All Tiers' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
];

const TeamsPage: React.FC = () => {
  const { teams, players: contextPlayers } = useData();
  const allPlayers = contextPlayers && contextPlayers.length > 0 ? contextPlayers : mockPlayers;
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...teams]
      .sort((a, b) => b.rating - a.rating)
      .filter((t) => tier === 'all' || t.tier === (tier as TeamTier))
      .filter(
        (t) =>
          term === '' ||
          t.name.toLowerCase().includes(term) ||
          t.roster.some((p) => p.nickname.toLowerCase().includes(term))
      );
  }, [teams, search, tier]);

  const toggleExpanded = (slug: string) => {
    setExpandedSlug((current) => (current === slug ? null : slug));
  };

  return (
    <section className="teams-page">
      <div className="container">
        <div className="teams-filters">
          <div className="teams-search">
            <Search size={16} className="teams-search__icon" />
            <input
              type="text"
              className="input-field teams-search__input"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CustomSelect value={tier} onChange={setTier} options={tierOptions} />
        </div>

        <div className="team-list">
          {rows.map((team, i) => {
            const isExpanded = expandedSlug === team.slug;
            return (
              <div key={team.slug} className="team-list__item">
                <div
                  className={`team-row panel${isExpanded ? ' team-row--expanded' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(team.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleExpanded(team.slug);
                  }}
                >
                  <span className="team-row__rank">#{i + 1}</span>
                  <TeamLogo name={team.name} size="lg" />
                  <div className="team-row__main">
                    <p className="team-row__name">
                      {team.name} <span className="text-tertiary team-row__rating">({team.rating} ASCENT Rating)</span>
                    </p>
                    <p className="text-secondary team-row__roster">{team.roster.map((p) => p.nickname).join(' • ')}</p>
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

          {rows.length === 0 && <p className="text-secondary team-list__empty">No teams found.</p>}
        </div>
      </div>
    </section>
  );
};

export default TeamsPage;
