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
  Shield
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { TeamSummary, TeamTier, SortDirection } from '@/types';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import AdminTeamModal from '../components/AdminTeamModal';
import TierBadge from '../../Teams/components/TierBadge';
import TeamLogo from '../../Teams/components/TeamLogo';
import '../Admin.css';

type AdminTeamSortKey = 'name' | 'tier' | 'rating' | 'winRate' | 'roster';

const TIER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'T1', label: 'Tier 1 (Pro)' },
  { value: 'T2', label: 'Tier 2 (Challenger)' },
  { value: 'T3', label: 'Tier 3 (Open)' },
];

const AdminTeams: React.FC = () => {
  const { teams, addTeam, updateTeam, deleteTeam } = useData();
  const [filterTier, setFilterTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<AdminTeamSortKey>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamSummary | null>(null);

  const handleSort = (key: AdminTeamSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Top metrics calculations
  const topTeam = useMemo(() => {
    if (teams.length === 0) return null;
    return [...teams].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }, [teams]);

  const avgRating = useMemo(() => {
    if (teams.length === 0) return 0;
    return Math.round(teams.reduce((acc, t) => acc + (t.rating || 0), 0) / teams.length);
  }, [teams]);

  const t1Count = useMemo(() => teams.filter((t) => t.tier === 'T1').length, [teams]);
  const t2Count = useMemo(() => teams.filter((t) => t.tier === 'T2').length, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (filterTier !== 'all' && team.tier !== filterTier) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = team.name.toLowerCase().includes(q) || team.slug.toLowerCase().includes(q);
        const matchCoach = team.coach?.toLowerCase().includes(q) || false;
        const matchRoster = (team.roster || []).some((p) => p.nickname.toLowerCase().includes(q));
        return matchName || matchCoach || matchRoster;
      }
      return true;
    });
  }, [teams, filterTier, searchQuery]);

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortKey === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortKey === 'tier') {
        const tierOrder: Record<string, number> = { T1: 3, T2: 2, T3: 1 };
        valA = tierOrder[a.tier] || 0;
        valB = tierOrder[b.tier] || 0;
      } else if (sortKey === 'rating') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      } else if (sortKey === 'winRate') {
        valA = a.stats?.winRate ?? 65;
        valB = b.stats?.winRate ?? 65;
      } else if (sortKey === 'roster') {
        valA = a.roster?.length || 0;
        valB = b.roster?.length || 0;
      }

      if (valA === valB) return 0;
      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredTeams, sortKey, sortDirection]);

  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleEdit = (team: TeamSummary) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleDelete = (slug: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteTeam(slug);
    }
  };

  const handleSave = (teamData: Partial<TeamSummary>) => {
    if (editingTeam) {
      updateTeam(editingTeam.slug, teamData);
    } else {
      const newTeam: TeamSummary = {
        name: teamData.name || 'New Team',
        slug: teamData.slug || 'new-team',
        tier: (teamData.tier as TeamTier) || 'T3',
        rating: teamData.rating || 1000,
        roster: teamData.roster || [],
        founded: teamData.founded || 'Est. 2024',
        coach: teamData.coach || '',
        analyst: teamData.analyst || '',
        manager: teamData.manager || '',
        bio: teamData.bio || '',
        twitterUrl: teamData.twitterUrl || '',
        discordUrl: teamData.discordUrl || '',
        twitchUrl: teamData.twitchUrl || '',
        websiteUrl: teamData.websiteUrl || '',
        stats: teamData.stats,
      };
      addTeam(newTeam);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Teams & Organizations</h1>
          <p className="admin-page-header__subtitle">
            Manage registered teams, tiers, ASCENT rankings, active rosters, coaches, and statistics.
          </p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Create Team Profile
          </button>
        </div>
      </div>

      {/* Overview Stat Cards — Exactly identical to AdminPlayers.tsx */}
      <div className="admin-stats-grid">
        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon">
            <Users size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{teams.length}</div>
            <div className="admin-stat-card__label text-secondary">Total Teams</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--accent-positive)' }}>
            <Flame size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value text-positive">
              {topTeam ? `${topTeam.name} (${topTeam.rating})` : '—'}
            </div>
            <div className="admin-stat-card__label text-secondary">Top Rated Team</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--accent-neutral)' }}>
            <Swords size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{avgRating} pts</div>
            <div className="admin-stat-card__label text-secondary">League Avg Rating</div>
          </div>
        </div>

        <div className="panel admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: 'var(--tier-t1)' }}>
            <Shield size={20} />
          </div>
          <div>
            <div className="admin-stat-card__value">{t1Count} / {t2Count}</div>
            <div className="admin-stat-card__label text-secondary">Tier 1 / Tier 2</div>
          </div>
        </div>
      </div>

      <div className="admin-panel-section panel">
        {/* Search & Filters Row — Exactly matching AdminPlayers.tsx */}
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
                placeholder="Search team, coach, player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>

            {/* Tier Filter Dropdown */}
            <div style={{ width: '200px' }}>
              <CustomSelect
                options={TIER_FILTER_OPTIONS}
                value={filterTier}
                onChange={(val) => setFilterTier(val)}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{sortedTeams.length}</strong> of {teams.length} teams
          </div>
        </div>

        {/* Teams Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Team <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tier')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Tier <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rating')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ASCENT Rating <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Head Coach</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('roster')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Roster ({filteredTeams.reduce((sum, t) => sum + (t.roster?.length || 0), 0)}) <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('winRate')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Win Rate <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((t, idx) => (
                <tr key={t.slug}>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <TeamLogo name={t.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/{t.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <TierBadge tier={t.tier} />
                  </td>
                  <td style={{ fontWeight: 'var(--fw-bold)', fontFamily: 'monospace' }}>
                    {t.rating} pts
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {t.coach ? t.coach : <span style={{ color: 'var(--text-tertiary)' }}>Not assigned</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {(t.roster && t.roster.length > 0)
                          ? t.roster.map(p => p.nickname).join(', ')
                          : 'No roster assigned'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {t.stats?.winRate ? `${t.stats.winRate}%` : '65%'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {t.stats?.streak || '3 Wins'}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end', display: 'flex', gap: '6px' }}>
                      <Link
                        to={`/teams/${t.slug}`}
                        target="_blank"
                        className="admin-icon-btn"
                        title="View Public Profile"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        className="admin-icon-btn"
                        title="Edit Team"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete Team"
                        onClick={() => handleDelete(t.slug)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedTeams.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No teams found matching criteria. Click "Create Team Profile" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        team={editingTeam}
      />
    </>
  );
};

export default AdminTeams;
