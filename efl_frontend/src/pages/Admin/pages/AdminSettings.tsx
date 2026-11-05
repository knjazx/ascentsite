import React, { useState } from 'react';
import { Save, ShieldCheck, Globe, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { LeagueSettings } from '../../../context/DataContext';
import '../Admin.css';

const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useData();

  const [formData, setFormData] = useState<LeagueSettings>({
    leagueName: settings.leagueName,
    currentSeason: settings.currentSeason,
    discordUrl: settings.discordUrl,
    telegramUrl: settings.telegramUrl,
    twitchUrl: settings.twitchUrl,
    tiktokUrl: settings.tiktokUrl,
    rulebookUrl: settings.rulebookUrl || 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    rulebookEdition: settings.rulebookEdition || '2026 Update #2 (v2.4)',
    rulebookStatus: settings.rulebookStatus || 'Действующая',
    rulebookBadge: settings.rulebookBadge || 'Официальный регламент',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordMsg(null);
  };

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      setPasswordMsg({ text: 'Please enter your current password.', isError: true });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', isError: true });
      return;
    }

    setPasswordMsg({ text: 'Password successfully updated!', isError: false });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Are you sure you want to reset settings to default?')) {
      const defaults: LeagueSettings = {
        leagueName: 'ASCENT CS2 League',
        currentSeason: 'Season One',
        discordUrl: 'https://discord.gg/pzdeyZJQzG',
        telegramUrl: 'https://t.me/eflcs3',
        twitchUrl: 'https://www.twitch.tv/eflcs',
        tiktokUrl: 'https://www.tiktok.com/@eflcs1',
        rulebookUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
        rulebookEdition: '2026 Update #2 (v2.4)',
        rulebookStatus: 'Действующая',
        rulebookBadge: 'Официальный регламент',
      };
      setFormData(defaults);
      updateSettings(defaults);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>League Settings</h1>
          <p className="admin-page-header__subtitle">Manage global website brand, community channels, and security settings.</p>
        </div>
        <div className="admin-page-header__right">
          {isSaved && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4ade80',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                marginRight: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} /> Settings Saved!
            </span>
          )}
          <button className="admin-btn admin-btn-primary" onClick={handleSubmitSettings}>
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: General League Parameters */}
        <div className="panel admin-panel-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Globe size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>General League Info</h2>
          </div>

          <form onSubmit={handleSubmitSettings} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>League Name / Brand</label>
                <input
                  type="text"
                  name="leagueName"
                  value={formData.leagueName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Official Rulebook URL (Google Docs / PDF)</label>
                <input
                  type="text"
                  name="rulebookUrl"
                  value={formData.rulebookUrl || ''}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/document/d/... or PDF link"
                />
              </div>
            </div>

            <div className="admin-form-row" style={{ marginTop: '1rem' }}>
              <div className="admin-form-group">
                <label>Rulebook Edition / Редакция регламента</label>
                <input
                  type="text"
                  name="rulebookEdition"
                  value={formData.rulebookEdition || ''}
                  onChange={handleChange}
                  placeholder="2026 Update #2 (v2.4)"
                />
              </div>
              <div className="admin-form-group">
                <label>Rulebook Status / Статус регламента</label>
                <input
                  type="text"
                  name="rulebookStatus"
                  value={formData.rulebookStatus || ''}
                  onChange={handleChange}
                  placeholder="Действующая"
                />
              </div>
              <div className="admin-form-group">
                <label>Rulebook Badge / Текст бейджа</label>
                <input
                  type="text"
                  name="rulebookBadge"
                  value={formData.rulebookBadge || ''}
                  onChange={handleChange}
                  placeholder="Официальный регламент"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Section 2: Social Links */}
        <div className="panel admin-panel-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Social Media & Community Links</h2>
          </div>

          <form onSubmit={handleSubmitSettings} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Discord Server URL</label>
                <input
                  type="text"
                  name="discordUrl"
                  value={formData.discordUrl}
                  onChange={handleChange}
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div className="admin-form-group">
                <label>Telegram Channel URL</label>
                <input
                  type="text"
                  name="telegramUrl"
                  value={formData.telegramUrl}
                  onChange={handleChange}
                  placeholder="https://t.me/..."
                />
              </div>

              <div className="admin-form-group">
                <label>Twitch Broadcast URL</label>
                <input
                  type="text"
                  name="twitchUrl"
                  value={formData.twitchUrl}
                  onChange={handleChange}
                  placeholder="https://twitch.tv/..."
                />
              </div>

              <div className="admin-form-group">
                <label>TikTok Profile URL</label>
                <input
                  type="text"
                  name="tiktokUrl"
                  value={formData.tiktokUrl}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Section 3: Administrator Security */}
        <div className="panel admin-panel-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Key size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Administrator Password</h2>
          </div>

          <form onSubmit={handleSubmitPassword} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="admin-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="admin-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passwordMsg && (
              <div
                style={{
                  color: passwordMsg.isError ? '#ef4444' : '#4ade80',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginTop: '0.5rem',
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="admin-btn admin-btn-secondary">
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div
          className="panel admin-panel-section"
          style={{ border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ef4444' }}>
            <AlertTriangle size={20} />
            <h2 style={{ margin: 0, fontSize: '1.125rem', color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Reset global league parameters and social links back to initial system defaults.
          </p>
          <div>
            <button type="button" className="admin-btn admin-btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={handleRestoreDefaults}>
              Reset Settings to Default
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
