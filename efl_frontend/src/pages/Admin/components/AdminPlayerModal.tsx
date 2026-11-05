import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Activity,
  Globe,
  Sliders,
  Crosshair
} from 'lucide-react';
import type { PlayerProfile } from '@/types';
import { getKD, getKDDiff } from '@/types';
import { useData } from '../../../context/DataContext';
import { getPlayerProfile } from '@/data/mocks/playersMockData';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';

interface AdminPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: Partial<PlayerProfile>) => void;
  player: PlayerProfile | null;
}

type ModalTab = 'identity' | 'stats' | 'socials' | 'gear';

const ROLE_OPTIONS = [
  { value: 'Rifler / Entry Fragger', label: 'Rifler / Entry Fragger' },
  { value: 'Sniper (AWPer)', label: 'Sniper (AWPer)' },
  { value: 'Sniper / Hybrid', label: 'Sniper / Hybrid' },
  { value: 'IGL / Captain', label: 'IGL / Captain' },
  { value: 'Rifler / Playmaker', label: 'Rifler / Playmaker' },
  { value: 'Rifler / Anchor', label: 'Rifler / Anchor' },
  { value: 'Rifler / Lurker', label: 'Rifler / Lurker' },
  { value: 'Support / Anchor', label: 'Support / Anchor' },
];

const AdminPlayerModal: React.FC<AdminPlayerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  player,
}) => {
  const { teams, players } = useData();
  const [activeTab, setActiveTab] = useState<ModalTab>('identity');

  const [formData, setFormData] = useState<Partial<PlayerProfile>>({
    nickname: '',
    realName: '',
    age: 20,
    team: teams[0]?.name || '',
    role: 'Rifler / Entry Fragger',
    avatar: '',
    bio: '',
    maps: 0,
    rounds: 0,
    kills: 0,
    deaths: 0,
    ratingEfl: 1.05,
    adr: 78,
    headshotPct: 50,
    kastPct: 72,
    impactRating: 1.1,
    clutchSuccessPct: 60,
    steamUrl: '',
    faceitUrl: '',
    twitchUrl: '',
    twitterUrl: '',
    discordHandle: '',
    gear: {
      mouse: '',
      dpi: 800,
      sensitivity: 1.2,
      eDpi: 960,
      hz: 1000,
      zoomSensitivity: 1.0,
      crosshairCode: '',
      resolution: '1280x960',
      aspectRatio: '4:3',
      scalingMode: 'Stretched',
      keyboard: '',
      headset: '',
      monitor: '',
    },
  });

  useEffect(() => {
    if (player) {
      // Pre-fill with complete profile data (either from player or getPlayerProfile fallback)
      const fullProfile = getPlayerProfile(player.id, players) || player;
      const initialRating = fullProfile.ratingAscent ?? fullProfile.ratingEfl ?? 1.05;
      setFormData({
        ...fullProfile,
        ratingAscent: initialRating,
        ratingEfl: initialRating,
        gear: {
          mouse: fullProfile.gear?.mouse || '',
          dpi: fullProfile.gear?.dpi ?? 800,
          sensitivity: fullProfile.gear?.sensitivity ?? 1.2,
          eDpi: fullProfile.gear?.eDpi ?? 960,
          hz: fullProfile.gear?.hz ?? 1000,
          zoomSensitivity: fullProfile.gear?.zoomSensitivity ?? 1.0,
          crosshairCode: fullProfile.gear?.crosshairCode || '',
          resolution: fullProfile.gear?.resolution || '1280x960',
          aspectRatio: fullProfile.gear?.aspectRatio || '4:3',
          scalingMode: fullProfile.gear?.scalingMode || 'Stretched',
          keyboard: fullProfile.gear?.keyboard || '',
          headset: fullProfile.gear?.headset || '',
          monitor: fullProfile.gear?.monitor || '',
        },
      });
    } else {
      setFormData({
        nickname: '',
        realName: '',
        age: 20,
        team: teams[0]?.name || '',
        role: 'Rifler / Entry Fragger',
        avatar: '',
        bio: '',
        maps: 0,
        rounds: 0,
        kills: 0,
        deaths: 0,
        ratingAscent: 1.05,
        ratingEfl: 1.05,
        adr: 78,
        headshotPct: 50,
        kastPct: 72,
        impactRating: 1.1,
        clutchSuccessPct: 60,
        steamUrl: '',
        faceitUrl: '',
        twitchUrl: '',
        twitterUrl: '',
        discordHandle: '',
        gear: {
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
          keyboard: 'Wooting 60HE',
          headset: 'HyperX Cloud II',
          monitor: 'ZOWIE XL2566K (360Hz)',
        },
      });
    }
    setActiveTab('identity');
  }, [player, isOpen, teams, players]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: parsedValue,
      };
      if (name === 'ratingEfl' || name === 'ratingAscent') {
        const val = Number(parsedValue);
        next.ratingAscent = val;
        next.ratingEfl = val;
      }
      return next;
    });
  };

  const handleGearChange = (name: string, value: string | number) => {
    setFormData((prev) => {
      const currentGear = prev.gear || {};
      const updatedGear = {
        ...currentGear,
        [name]: value,
      };

      // Auto-calculate eDPI if dpi or sensitivity changed
      if (name === 'dpi' || name === 'sensitivity') {
        const dpi = name === 'dpi' ? Number(value) : (currentGear.dpi || 800);
        const sens = name === 'sensitivity' ? Number(value) : (currentGear.sensitivity || 1.0);
        updatedGear.eDpi = Math.round(dpi * sens);
      }

      return {
        ...prev,
        gear: updatedGear,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRating = formData.ratingAscent ?? formData.ratingEfl ?? 1.05;
    onSave({
      ...formData,
      ratingAscent: finalRating,
      ratingEfl: finalRating,
    });
    onClose();
  };

  const teamOptions = teams.map((t) => ({ value: t.name, label: t.name }));

  const currentStats = {
    id: formData.id || 'temp',
    nickname: formData.nickname || '',
    team: formData.team || '',
    maps: formData.maps || 0,
    rounds: formData.rounds || 0,
    kills: formData.kills || 0,
    deaths: formData.deaths || 0,
  };

  const kdRatio = getKD(currentStats).toFixed(2);
  const kdDiff = getKDDiff(currentStats);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '720px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary-color)" />
            <h2>{player ? `Edit Profile: ${player.nickname}` : 'Create New Player Profile'}</h2>
          </div>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '0 var(--space-4)',
            gap: 'var(--space-2)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveTab('identity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'identity' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'identity' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'identity' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <User size={15} />
            Identity & Bio
          </button>

          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'stats' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'stats' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'stats' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Activity size={15} />
            Stats & Ratings
          </button>

          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === 'socials' ? 'active' : ''}`}
            onClick={() => setActiveTab('socials')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'socials' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'socials' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'socials' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={15} />
            Socials & Links
          </button>

          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === 'gear' ? 'active' : ''}`}
            onClick={() => setActiveTab('gear')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'gear' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'gear' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'gear' ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Sliders size={15} />
            CS2 Gear & Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="admin-modal-body" style={{ overflowY: 'auto', maxHeight: '60vh', padding: '1.5rem' }}>
            {/* Tab 1: Identity & Bio */}
            {activeTab === 'identity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Player Nickname *</label>
                    <input
                      type="text"
                      name="nickname"
                      className="admin-input"
                      value={formData.nickname || ''}
                      onChange={handleChange}
                      placeholder="e.g. donk"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Real Name</label>
                    <input
                      type="text"
                      name="realName"
                      className="admin-input"
                      value={formData.realName || ''}
                      onChange={handleChange}
                      placeholder="e.g. Danil Kryshkovets"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Team</label>
                    {teamOptions.length > 0 ? (
                      <CustomSelect
                        options={teamOptions}
                        value={formData.team || ''}
                        onChange={(val) => setFormData((prev) => ({ ...prev, team: val }))}
                      />
                    ) : (
                      <input
                        type="text"
                        name="team"
                        className="admin-input"
                        value={formData.team || ''}
                        onChange={handleChange}
                        placeholder="e.g. Spirit"
                        required
                      />
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label>Role</label>
                    <CustomSelect
                      options={ROLE_OPTIONS}
                      value={formData.role || 'Rifler / Entry Fragger'}
                      onChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      className="admin-input"
                      value={formData.age ?? 20}
                      onChange={handleChange}
                      min={14}
                      max={45}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Avatar Photo URL</label>
                    <input
                      type="url"
                      name="avatar"
                      className="admin-input"
                      value={formData.avatar || ''}
                      onChange={handleChange}
                      placeholder="https://... image URL (leave empty for auto-generated avatar)"
                    />
                  </div>
                </div>

                {/* Avatar Preview */}
                {formData.avatar && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <img
                      src={formData.avatar}
                      alt="Avatar Preview"
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avatar Image Live Preview</span>
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Player Bio / Background</label>
                  <textarea
                    name="bio"
                    className="admin-textarea"
                    rows={3}
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="Short bio or background description..."
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Stats & Ratings */}
            {activeTab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Maps Played</label>
                    <input
                      type="number"
                      name="maps"
                      className="admin-input"
                      value={formData.maps ?? 0}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Rounds Played</label>
                    <input
                      type="number"
                      name="rounds"
                      className="admin-input"
                      value={formData.rounds ?? 0}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Total Kills</label>
                    <input
                      type="number"
                      name="kills"
                      className="admin-input"
                      value={formData.kills ?? 0}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Total Deaths</label>
                    <input
                      type="number"
                      name="deaths"
                      className="admin-input"
                      value={formData.deaths ?? 0}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>ASCENT Rating</label>
                    <input
                      type="number"
                      name="ratingAscent"
                      className="admin-input"
                      step="0.01"
                      value={formData.ratingAscent ?? formData.ratingEfl ?? 1.05}
                      onChange={handleChange}
                      min={0}
                      max={3}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>ADR (Average Damage / Round)</label>
                    <input
                      type="number"
                      name="adr"
                      className="admin-input"
                      step="0.1"
                      value={formData.adr ?? 78}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Headshot %</label>
                    <input
                      type="number"
                      name="headshotPct"
                      className="admin-input"
                      step="0.1"
                      value={formData.headshotPct ?? 50}
                      onChange={handleChange}
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>KAST % (Kill/Assist/Survive/Trade)</label>
                    <input
                      type="number"
                      name="kastPct"
                      className="admin-input"
                      step="0.1"
                      value={formData.kastPct ?? 72}
                      onChange={handleChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Impact Rating</label>
                    <input
                      type="number"
                      name="impactRating"
                      className="admin-input"
                      step="0.01"
                      value={formData.impactRating ?? 1.15}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Clutch Success %</label>
                    <input
                      type="number"
                      name="clutchSuccessPct"
                      className="admin-input"
                      value={formData.clutchSuccessPct ?? 60}
                      onChange={handleChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Live Calculated Preview Box */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Rating</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {Number(formData.ratingAscent ?? formData.ratingEfl ?? 1.05).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Computed K/D</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: Number(kdRatio) >= 1.0 ? '#4ade80' : '#ef4444' }}>
                      {kdRatio}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>K-D Diff</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: kdDiff >= 0 ? '#4ade80' : '#ef4444' }}>
                      {kdDiff > 0 ? `+${kdDiff}` : kdDiff}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Socials & Game Links */}
            {activeTab === 'socials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label>Steam Profile URL</label>
                  <input
                    type="url"
                    name="steamUrl"
                    className="admin-input"
                    value={formData.steamUrl || ''}
                    onChange={handleChange}
                    placeholder="https://steamcommunity.com/id/..."
                  />
                </div>

                <div className="admin-form-group">
                  <label>FACEIT Profile URL</label>
                  <input
                    type="url"
                    name="faceitUrl"
                    className="admin-input"
                    value={formData.faceitUrl || ''}
                    onChange={handleChange}
                    placeholder="https://www.faceit.com/en/players/..."
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Twitch Channel URL</label>
                    <input
                      type="url"
                      name="twitchUrl"
                      className="admin-input"
                      value={formData.twitchUrl || ''}
                      onChange={handleChange}
                      placeholder="https://www.twitch.tv/..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Twitter / X Profile URL</label>
                    <input
                      type="url"
                      name="twitterUrl"
                      className="admin-input"
                      value={formData.twitterUrl || ''}
                      onChange={handleChange}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Discord Tag</label>
                  <input
                    type="text"
                    name="discordHandle"
                    className="admin-input"
                    value={formData.discordHandle || ''}
                    onChange={handleChange}
                    placeholder="username#0000 or handle"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: CS2 Gear & Settings */}
            {activeTab === 'gear' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Crosshair size={14} color="var(--accent-positive)" />
                    CS2 Crosshair Share Code
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.gear?.crosshairCode || ''}
                    onChange={(e) => handleGearChange('crosshairCode', e.target.value)}
                    placeholder="e.g. CSGO-7b7qE-Mh3zN-V9XwK-sZc87-8sF5P"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Mouse DPI</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.gear?.dpi ?? 800}
                      onChange={(e) => handleGearChange('dpi', Number(e.target.value))}
                      min={100}
                      step={50}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>In-Game Sensitivity</label>
                    <input
                      type="number"
                      className="admin-input"
                      step="0.01"
                      value={formData.gear?.sensitivity ?? 1.2}
                      onChange={(e) => handleGearChange('sensitivity', Number(e.target.value))}
                      min={0.1}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Calculated eDPI</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.gear?.eDpi ?? Math.round((formData.gear?.dpi || 800) * (formData.gear?.sensitivity || 1.2))}
                      onChange={(e) => handleGearChange('eDpi', Number(e.target.value))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Polling Rate (Hz)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.gear?.hz ?? 1000}
                      onChange={(e) => handleGearChange('hz', Number(e.target.value))}
                      step={500}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Resolution</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.resolution || '1280x960'}
                      onChange={(e) => handleGearChange('resolution', e.target.value)}
                      placeholder="e.g. 1280x960, 1920x1080"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Aspect Ratio / Scaling</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.scalingMode || 'Stretched (4:3)'}
                      onChange={(e) => handleGearChange('scalingMode', e.target.value)}
                      placeholder="e.g. Stretched, Black Bars"
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  Hardware Devices
                </h4>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Mouse Model</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.mouse || ''}
                      onChange={(e) => handleGearChange('mouse', e.target.value)}
                      placeholder="e.g. Razer DeathAdder V3 Pro"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Keyboard Model</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.keyboard || ''}
                      onChange={(e) => handleGearChange('keyboard', e.target.value)}
                      placeholder="e.g. Wooting 60HE"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Headset Model</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.headset || ''}
                      onChange={(e) => handleGearChange('headset', e.target.value)}
                      placeholder="e.g. HyperX Cloud II"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Monitor Model</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.gear?.monitor || ''}
                      onChange={(e) => handleGearChange('monitor', e.target.value)}
                      placeholder="e.g. ZOWIE XL2566K (360Hz)"
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
              {player ? 'Save Profile Changes' : 'Create Player Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPlayerModal;

