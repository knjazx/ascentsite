import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Star } from 'lucide-react';
import type { TeamSummary, TeamTier, TeamPlayer, TeamStats } from '@/types';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { getPlayerProfile } from '@/data/mocks/playersMockData';

interface AdminTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: Partial<TeamSummary>) => void;
  team: TeamSummary | null;
}

type ModalTab = 'identity' | 'roster' | 'staff' | 'stats' | 'socials';

const TIER_OPTIONS: { value: TeamTier; label: string }[] = [
  { value: 'T1', label: 'Tier 1 (Elite / Pro)' },
  { value: 'T2', label: 'Tier 2 (Challenger)' },
  { value: 'T3', label: 'Tier 3 (Open / Academy)' },
];

const ROLE_OPTIONS = [
  { value: 'Captain / IGL', label: 'Captain / IGL' },
  { value: 'AWP Sniper', label: 'AWP Sniper' },
  { value: 'Entry Fragger', label: 'Entry Fragger' },
  { value: 'Rifler / Star', label: 'Rifler / Star' },
  { value: 'Support / Anchor', label: 'Support / Anchor' },
  { value: 'Lurker', label: 'Lurker' },
  { value: 'Substitute / Reserve', label: 'Substitute / Reserve' },
];

const DEFAULT_ROLES = [
  'Captain / IGL',
  'AWP Sniper',
  'Entry Fragger',
  'Rifler / Star',
  'Support / Anchor'
];

const AdminTeamModal: React.FC<AdminTeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  team,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('identity');

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    tier: TeamTier;
    rating: number;
    founded: string;
    worldRank: number;
    bio: string;
    coach: string;
    analyst: string;
    manager: string;
    twitterUrl: string;
    discordUrl: string;
    twitchUrl: string;
    websiteUrl: string;
    stats: TeamStats;
    roster: TeamPlayer[];
  }>({
    name: '',
    slug: '',
    tier: 'T1',
    rating: 1800,
    founded: 'Est. 2020',
    worldRank: 1,
    bio: '',
    coach: '',
    analyst: '',
    manager: '',
    twitterUrl: '',
    discordUrl: '',
    twitchUrl: '',
    websiteUrl: '',
    stats: {
      matchesPlayed: 45,
      wins: 30,
      losses: 15,
      winRate: 67,
      streak: '3 Wins',
      roundWinRate: 55,
      pistolWinRate: 60,
      overtimeWinRate: 70,
    },
    roster: [],
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        slug: team.slug,
        tier: team.tier,
        rating: team.rating,
        founded: team.founded || 'Est. 2020',
        worldRank: team.worldRank || 1,
        bio: team.bio || '',
        coach: team.coach || '',
        analyst: team.analyst || '',
        manager: team.manager || '',
        twitterUrl: team.twitterUrl || '',
        discordUrl: team.discordUrl || '',
        twitchUrl: team.twitchUrl || '',
        websiteUrl: team.websiteUrl || '',
        stats: {
          matchesPlayed: team.stats?.matchesPlayed ?? 45,
          wins: team.stats?.wins ?? 30,
          losses: team.stats?.losses ?? 15,
          winRate: team.stats?.winRate ?? 67,
          streak: team.stats?.streak ?? '3 Wins',
          roundWinRate: team.stats?.roundWinRate ?? 55,
          pistolWinRate: team.stats?.pistolWinRate ?? 60,
          overtimeWinRate: team.stats?.overtimeWinRate ?? 70,
        },
        roster: (team.roster || []).map((p, idx) => ({
          nickname: p.nickname,
          realName: p.realName || '',
          role: p.role || DEFAULT_ROLES[idx % DEFAULT_ROLES.length],
          isCaptain: p.isCaptain ?? idx === 0,
          isSniper: p.isSniper ?? idx === 1,
        })),
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        tier: 'T1',
        rating: 1750,
        founded: 'Est. 2024',
        worldRank: 10,
        bio: '',
        coach: 'Head Coach',
        analyst: 'Tactical Analyst',
        manager: 'Team Manager',
        twitterUrl: '',
        discordUrl: '',
        twitchUrl: '',
        websiteUrl: '',
        stats: {
          matchesPlayed: 20,
          wins: 13,
          losses: 7,
          winRate: 65,
          streak: '2 Wins',
          roundWinRate: 54,
          pistolWinRate: 58,
          overtimeWinRate: 66,
        },
        roster: [
          { nickname: '', role: 'Captain / IGL', isCaptain: true, isSniper: false },
          { nickname: '', role: 'AWP Sniper', isCaptain: false, isSniper: true },
          { nickname: '', role: 'Entry Fragger', isCaptain: false, isSniper: false },
          { nickname: '', role: 'Rifler / Star', isCaptain: false, isSniper: false },
          { nickname: '', role: 'Support / Anchor', isCaptain: false, isSniper: false },
        ],
      });
    }
    setActiveTab('identity');
  }, [team, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!team) {
      const autoSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name: newName, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleStatChange = (field: keyof TeamStats, value: any) => {
    setFormData((prev) => {
      const newStats = {
        ...prev.stats,
        [field]: typeof prev.stats[field] === 'number' ? Number(value) : value,
      };
      if (field === 'wins' || field === 'losses') {
        const matches = newStats.wins + newStats.losses;
        newStats.matchesPlayed = matches;
        newStats.winRate = matches > 0 ? Math.round((newStats.wins / matches) * 100) : 0;
      }
      return { ...prev, stats: newStats };
    });
  };

  const addPlayer = () => {
    const nextRole = DEFAULT_ROLES[formData.roster.length % DEFAULT_ROLES.length] || 'Substitute / Reserve';
    setFormData(prev => ({
      ...prev,
      roster: [
        ...prev.roster,
        {
          nickname: '',
          role: nextRole,
          isCaptain: false,
          isSniper: false,
        }
      ]
    }));
  };

  const updatePlayer = (index: number, field: keyof TeamPlayer, value: any) => {
    setFormData(prev => {
      const newRoster = [...prev.roster];
      newRoster[index] = {
        ...newRoster[index],
        [field]: value,
      };
      return { ...prev, roster: newRoster };
    });
  };

  const removePlayer = (index: number) => {
    setFormData(prev => {
      const newRoster = [...prev.roster];
      newRoster.splice(index, 1);
      return { ...prev, roster: newRoster };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRoster = formData.roster.filter(p => p.nickname.trim().length > 0);

    onSave({
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      tier: formData.tier,
      rating: Number(formData.rating),
      founded: formData.founded,
      worldRank: Number(formData.worldRank),
      bio: formData.bio,
      coach: formData.coach,
      analyst: formData.analyst,
      manager: formData.manager,
      twitterUrl: formData.twitterUrl,
      discordUrl: formData.discordUrl,
      twitchUrl: formData.twitchUrl,
      websiteUrl: formData.websiteUrl,
      stats: formData.stats,
      roster: validRoster,
    });
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div>
            <h2>{team ? `Edit Team: ${team.name}` : 'Create New Team'}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure team information, tier ranking, starting lineup, coaching staff, and statistics.
            </p>
          </div>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs — Clean text labels without stickers/icons */}
        <div className="admin-modal-tabs" style={{ display: 'flex', gap: '6px', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel-hover)' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveTab('identity')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Identity & Info
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('roster')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Active Roster ({formData.roster.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Coaching & Staff
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Team Stats
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'socials' ? 'active' : ''}`}
            onClick={() => setActiveTab('socials')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Links & Socials
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="admin-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {/* Tab 1: Identity */}
            {activeTab === 'identity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Team Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Natus Vincere"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="e.g. natus-vincere"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Tier Division</label>
                    <CustomSelect
                      options={TIER_OPTIONS}
                      value={formData.tier}
                      onChange={(val) => setFormData((prev) => ({ ...prev, tier: val as TeamTier }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>ASCENT Rating (Ranking Points) *</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Founded Year</label>
                    <input
                      type="text"
                      name="founded"
                      value={formData.founded}
                      onChange={handleChange}
                      placeholder="e.g. Est. 2019"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>World Ranking (#)</label>
                    <input
                      type="number"
                      name="worldRank"
                      value={formData.worldRank}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Team Description / Biography</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short description of the team, history, and competitive goals..."
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Roster (Synchronized with Player Profiles) */}
            {activeTab === 'roster' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Roster & Role Assignment</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Assign registered players and roles. Player photos, ratings, ADR, and K/D are automatically synced from player profiles.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={addPlayer}
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                  >
                    <Plus size={15} /> Add Player / Sub
                  </button>
                </div>

                {formData.roster.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-panel-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p className="text-secondary" style={{ margin: 0 }}>No players in roster. Click "Add Player / Sub" to assign starting five.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.roster.map((player, idx) => {
                      const playerProfile = player.nickname.trim() ? getPlayerProfile(player.nickname.trim()) : null;
                      const kd = playerProfile && playerProfile.deaths > 0 ? (playerProfile.kills / playerProfile.deaths).toFixed(2) : '1.05';

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            background: 'var(--bg-panel-hover)',
                            border: '1px solid var(--border-color)',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                #{idx + 1}
                              </span>
                              {player.isCaptain && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#ffd700', background: 'rgba(255, 215, 0, 0.12)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                  CAPTAIN
                                </span>
                              )}
                              {player.role?.includes('Substitute') && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                  SUBSTITUTE
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className={`admin-btn ${player.isCaptain ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                onClick={() => updatePlayer(idx, 'isCaptain', !player.isCaptain)}
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                title="Toggle Team Captain"
                              >
                                <Star size={12} /> Captain
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn admin-icon-btn--danger"
                                onClick={() => removePlayer(idx)}
                                title="Remove player from team"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '10px', alignItems: 'center' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', marginBottom: '3px', display: 'block' }}>Player Nickname *</label>
                              <input
                                type="text"
                                placeholder="e.g. donk, s1mple"
                                value={player.nickname}
                                onChange={(e) => updatePlayer(idx, 'nickname', e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', marginBottom: '3px', display: 'block' }}>Assigned In-Game Role</label>
                              <CustomSelect
                                options={ROLE_OPTIONS}
                                value={player.role || 'Rifler / Star'}
                                onChange={(val) => updatePlayer(idx, 'role', val)}
                              />
                            </div>
                          </div>

                          {/* Auto-Synchronized Profile Preview Info */}
                          {playerProfile && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 10px',
                                fontSize: '0.75rem',
                                marginTop: '2px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {playerProfile.avatar ? (
                                  <img
                                    src={playerProfile.avatar}
                                    alt={player.nickname}
                                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <User size={16} style={{ color: 'var(--text-tertiary)' }} />
                                )}
                                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{playerProfile.nickname}</span>
                                {playerProfile.realName && (
                                  <span style={{ color: 'var(--text-secondary)' }}>({playerProfile.realName})</span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
                                <span>Rating: <strong style={{ color: 'var(--text-primary)' }}>{(playerProfile.ratingEfl || 1.10).toFixed(2)}</strong></span>
                                <span>ADR: <strong style={{ color: 'var(--text-primary)' }}>{playerProfile.adr || 80}</strong></span>
                                <span>K/D: <strong style={{ color: 'var(--text-primary)' }}>{kd}</strong></span>
                                <span style={{ color: 'var(--accent-positive)', fontSize: '0.7rem' }}>✓ Synced</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Staff */}
            {activeTab === 'staff' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Coaching & Management Staff</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Head Coach</label>
                    <input
                      type="text"
                      name="coach"
                      value={formData.coach}
                      onChange={handleChange}
                      placeholder="e.g. B1ad3"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tactical Analyst</label>
                    <input
                      type="text"
                      name="analyst"
                      value={formData.analyst}
                      onChange={handleChange}
                      placeholder="e.g. Tactical Analyst"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Team Manager / Operations</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    placeholder="e.g. Team Operations Manager"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Stats */}
            {activeTab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Team Performance Metrics</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Matches Won</label>
                    <input
                      type="number"
                      value={formData.stats.wins}
                      onChange={(e) => handleStatChange('wins', e.target.value)}
                      min={0}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Matches Lost</label>
                    <input
                      type="number"
                      value={formData.stats.losses}
                      onChange={(e) => handleStatChange('losses', e.target.value)}
                      min={0}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Total Matches (Auto)</label>
                    <input
                      type="number"
                      value={formData.stats.matchesPlayed}
                      readOnly
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Match Win Rate (%)</label>
                    <input
                      type="number"
                      value={formData.stats.winRate}
                      onChange={(e) => handleStatChange('winRate', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Round Win Rate (%)</label>
                    <input
                      type="number"
                      value={formData.stats.roundWinRate ?? 55}
                      onChange={(e) => handleStatChange('roundWinRate', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Current Streak</label>
                    <input
                      type="text"
                      value={formData.stats.streak}
                      onChange={(e) => handleStatChange('streak', e.target.value)}
                      placeholder="e.g. 3 Wins or 1 Loss"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Pistol Round WR (%)</label>
                    <input
                      type="number"
                      value={formData.stats.pistolWinRate ?? 60}
                      onChange={(e) => handleStatChange('pistolWinRate', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Overtime WR (%)</label>
                    <input
                      type="number"
                      value={formData.stats.overtimeWinRate ?? 70}
                      onChange={(e) => handleStatChange('overtimeWinRate', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Socials */}
            {activeTab === 'socials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Official Team Links & Social Media</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Twitter / X Profile URL</label>
                    <input
                      type="url"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleChange}
                      placeholder="https://twitter.com/teamname"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Discord Community URL</label>
                    <input
                      type="url"
                      name="discordUrl"
                      value={formData.discordUrl}
                      onChange={handleChange}
                      placeholder="https://discord.gg/team"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Twitch Channel URL</label>
                    <input
                      type="url"
                      name="twitchUrl"
                      value={formData.twitchUrl}
                      onChange={handleChange}
                      placeholder="https://twitch.tv/teamname"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Official Website URL</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://team.gg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {team ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTeamModal;
