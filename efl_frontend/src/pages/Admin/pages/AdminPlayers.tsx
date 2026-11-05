import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  ExternalLink,
  Users,
  Flame,
  Swords,
  Shield,
  User
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { PlayerProfile, SortDirection } from '@/types';
import { getKD, getKDDiff, getPlayerRating } from '@/types';
import { getPlayerProfile } from '@/data/mocks/playersMockData';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import AscentRatingBadge from '@/components/ui/RatingBadge/AscentRatingBadge';
import AdminPlayerModal from '../components/AdminPlayerModal';
import '../Admin.css';

type AdminPlayerSortKey = 'kd' | 'kdDiff' | 'maps' | 'rounds' | 'rating' | 'adr';

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'sniper', label: 'Sniper / AWP' },
  { value: 'entry', label: 'Entry Fragger' },
  { value: 'igl', label: 'IGL / Captain' },
  { value: 'anchor', label: 'Anchor / Support' },
  { value: 'rifler', label: 'Rifler' },
];

const AdminPlayers: React.FC = () => {
  const { players, addPlayer, updatePlayer, deletePlayer, teams } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortKey, setSortKey] = useState<AdminPlayerSortKey>('rating');

  const teamFilterOptions = useMemo(() => [
    { value: 'all', label: 'All Teams' },
    ...teams.map((t) => ({ value: t.name, label: t.name })),
  ], [teams]);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);

  const handleSort = (key: AdminPlayerSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Convert raw players to enriched profiles for table display
  const enrichedPlayers = useMemo(() => {
    return players.map((p) => {
      const full = getPlayerProfile(p.id, players);
      return full || (p as PlayerProfile);
    });
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return enrichedPlayers.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nickname.toLowerCase().includes(q) ||
        (p.realName && p.realName.toLowerCase().includes(q)) ||
        p.team.toLowerCase().includes(q) ||
        (p.role && p.role.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || (p.role && p.role.toLowerCase().includes(roleFilter.toLowerCase()));
      const matchesTeam = teamFilter === 'all' || p.team === teamFilter;

      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [enrichedPlayers, searchQuery, roleFilter, teamFilter]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortKey === 'kd') {
        valA = getKD(a);
        valB = getKD(b);
      } else if (sortKey === 'kdDiff') {
        valA = getKDDiff(a);
        valB = getKDDiff(b);
      } else if (sortKey === 'maps') {
        valA = a.maps;
        valB = b.maps;
      } else if (sortKey === 'rounds') {
        valA = a.rounds;
        valB = b.rounds;
      } else if (sortKey === 'rating') {
        valA = getPlayerRating(a);
        valB = getPlayerRating(b);
      } else if (sortKey === 'adr') {
        valA = a.adr || 75;
        valB = b.adr || 75;
      }

      if (valA === valB) return 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredPlayers, sortKey, sortDirection]);

  // Key Summary Stats
  const topPlayer = useMemo(() => {
    if (enrichedPlayers.length === 0) return null;
    return [...enrichedPlayers].sort((a, b) => getPlayerRating(b) - getPlayerRating(a))[0];
  }, [enrichedPlayers]);

  const avgKD = useMemo(() => {
    if (enrichedPlayers.length === 0) return '0.00';
    const total = enrichedPlayers.reduce((acc, p) => acc + getKD(p), 0);
    return (total / enrichedPlayers.length).toFixed(2);
  }, [enrichedPlayers]);

  const handleCreate = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (player: PlayerProfile) => {
    const full = getPlayerProfile(player.id, players) || player;
    setEditingPlayer(full);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      deletePlayer(id);
    }
  };

  const handleSave = (playerData: Partial<PlayerProfile>) => {
    if (editingPlayer) {
      updatePlayer(editingPlayer.id, playerData);
    } else {
      const newPlayer: PlayerProfile = {
        id: `p-${Date.now()}`,
        slug: (playerData.nickname || 'player').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        nickname: playerData.nickname || 'Player',
        realName: playerData.realName || '',
        age: playerData.age || 20,
        team: playerData.team || (teams[0]?.name || 'Free Agent'),
        role: playerData.role || 'Rifler / Entry Fragger',
        avatar: playerData.avatar || '',
        bio: playerData.bio || '',
        maps: playerData.maps || 0,
        rounds: playerData.rounds || 0,
        kills: playerData.kills || 0,
        deaths: playerData.deaths || 0,
        ratingEfl: playerData.ratingEfl || 1.05,
        adr: playerData.adr || 75,
        headshotPct: playerData.headshotPct || 50,
        kastPct: playerData.kastPct || 70,
        impactRating: playerData.impactRating || 1.1,
        clutchSuccessPct: playerData.clutchSuccessPct || 60,
        steamUrl: playerData.steamUrl || '',
        faceitUrl: playerData.faceitUrl || '',
        twitchUrl: playerData.twitchUrl || '',
        twitterUrl: playerData.twitterUrl || '',
        discordHandle: playerData.discordHandle || '',
        gear: playerData.gear || {
          mouse: 'Logitech G Pro X Superlight 2',
          dpi: 800,
          sensitivity: 1.2,
          eDpi: 960,
          hz: 1000,
          zoomSensitivity: 1.0,
          crosshairCode: 'CSGO-7b7qE-Mh3zN-V9XwK-sZc87-8sF5P',
          resolution: '1280x960',
          aspectRatio: '4:3',
          scalingMode: 'Stretched',
        },
      };
      addPlayer(newPlayer);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Players & Statistics</h1>
          <p className="admin-page-header__subtitle">
            Manage player rosters, live profiles, CS2 gear, raw match statistics, and leaderboard rankings.
          </p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Create Player Profile
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="admin-stats-grid">
        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon">
            <Users size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{enrichedPlayers.length}</div>
            <div className="admin-stat-card__label text-secondary">Total Players</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--accent-positive)' }}>
            <Flame size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value text-positive">
              {topPlayer ? `${topPlayer.nickname} (${(topPlayer.ratingAscent || topPlayer.ratingEfl || 1.84).toFixed(2)})` : '—'}
            </div>
            <div className="admin-stat-card__label text-secondary">Top Rated Player</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--accent-neutral)' }}>
            <Swords size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{avgKD}</div>
            <div className="admin-stat-card__label text-secondary">League Avg K/D</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--tier-t1)' }}>
            <Shield size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{teams.length}</div>
            <div className="admin-stat-card__label text-secondary">Active Teams</div>
          </div>
        </div>
      </div>

      <div className="admin-panel-section panel">
        {/* Search & Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                }}
              />
              <input
                type="text"
                className="admin-input"
                placeholder="Search nickname, name, team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>

            {/* Team Filter */}
            <div style={{ width: '180px' }}>
              <CustomSelect
                options={teamFilterOptions}
                value={teamFilter}
                onChange={(val) => setTeamFilter(val)}
              />
            </div>

            {/* Role Filter */}
            <div style={{ width: '180px' }}>
              <CustomSelect
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{sortedPlayers.length}</strong> of {enrichedPlayers.length} players
          </div>
        </div>

        {/* Players Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>Role</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('maps')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Maps <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rounds')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Rounds <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>K / D</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('kdDiff')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    K-D Diff <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('kd')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    K/D <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rating')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Rating <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p, idx) => {
                const kd = getKD(p);
                const diff = getKDDiff(p);
                const rating = getPlayerRating(p);
                const playerSlug = p.slug || p.nickname.toLowerCase();

                return (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-panel-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {p.avatar ? (
                            <img src={p.avatar} alt={p.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={15} color="var(--text-tertiary)" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)' }}>
                            {p.nickname}
                          </div>
                          {p.realName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {p.realName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{p.team}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.role || 'Rifler'}
                      </span>
                    </td>
                    <td>{p.maps}</td>
                    <td>{p.rounds}</td>
                    <td>
                      {p.kills} / {p.deaths}
                    </td>
                    <td style={{ fontWeight: 'bold', color: diff >= 0 ? '#4ade80' : '#ef4444' }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor:
                            kd >= 1.15
                              ? 'rgba(74, 222, 128, 0.15)'
                              : kd >= 1.0
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color: kd >= 1.15 ? '#4ade80' : kd >= 1.0 ? '#60a5fa' : '#ef4444',
                        }}
                      >
                        {kd.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <AscentRatingBadge rating={rating} size="sm" />
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link
                          to={`/players/${playerSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-icon-btn"
                          title="View Live Player Profile"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <button
                          className="admin-icon-btn"
                          title="Edit Full Profile & Stats"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-btn--danger"
                          title="Delete Player"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedPlayers.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No players found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        player={editingPlayer}
      />
    </>
  );
};

export default AdminPlayers;

