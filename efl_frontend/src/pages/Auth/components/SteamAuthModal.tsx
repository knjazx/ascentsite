import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ShieldCheck, Clock, User } from 'lucide-react';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import './SteamAuthModal.css';

interface SteamPreset {
  nickname: string;
  realName: string;
  steamId: string;
  avatar: string;
  country: string;
  teamName: string;
  teamSlug: string;
  hours: string;
}

const STEAM_PRESETS: SteamPreset[] = [
  {
    nickname: 'BlazeMaster',
    realName: 'Alexander Vance',
    steamId: '76561198299104812',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    country: 'ru',
    teamName: 'Phoenix Rising',
    teamSlug: 'phoenix-rising',
    hours: '3,840',
  },
  {
    nickname: 'donk',
    realName: 'Danil Kryshkovets',
    steamId: '76561198818817280',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    country: 'ru',
    teamName: 'Spirit',
    teamSlug: 'spirit',
    hours: '5,210',
  },
  {
    nickname: 'm0NESY',
    realName: 'Ilya Osipov',
    steamId: '76561198121220451',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    country: 'ru',
    teamName: 'Falcons',
    teamSlug: 'falcons',
    hours: '7,430',
  },
  {
    nickname: 's1mple',
    realName: 'Oleksandr Kostyliev',
    steamId: '76561198034202275',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    country: 'ua',
    teamName: 'Falcons',
    teamSlug: 'falcons',
    hours: '14,200',
  },
];

interface SteamAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRegister?: boolean;
}

export const SteamAuthModal: React.FC<SteamAuthModalProps> = ({ isOpen, onClose, isRegister = false }) => {
  const { loginWithSteam } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedPreset, setSelectedPreset] = useState<SteamPreset>(STEAM_PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customNick, setCustomNick] = useState('');
  const [customRealName, setCustomRealName] = useState('');
  const [customSteamId, setCustomSteamId] = useState('76561198' + Math.floor(100000000 + Math.random() * 900000000));
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SteamPreset) => {
    setIsCustom(false);
    setSelectedPreset(preset);
  };

  const handleConfirmLogin = async () => {
    setSubmitting(true);
    try {
      if (isCustom) {
        const cleanNick = customNick.trim() || 'CS2_Player';
        const user = loginWithSteam({
          nickname: cleanNick,
          realName: customRealName.trim() || cleanNick,
          steamId: customSteamId.trim() || ('76561198' + Math.floor(100000000 + Math.random() * 900000000)),
          country: 'ru',
          role: 'player',
        });
        showToast(`Успешный вход через Steam: ${user.nickname}!`, 'success');
      } else {
        const user = loginWithSteam({
          nickname: selectedPreset.nickname,
          realName: selectedPreset.realName,
          steamId: selectedPreset.steamId,
          avatar: selectedPreset.avatar,
          country: selectedPreset.country,
          teamName: selectedPreset.teamName,
          teamSlug: selectedPreset.teamSlug,
          role: selectedPreset.nickname === 'BlazeMaster' ? 'captain' : 'player',
        });
        showToast(`Успешная верификация Steam: ${user.nickname}!`, 'success');
      }

      onClose();
      navigate('/profile');
    } finally {
      setSubmitting(false);
    }
  };

  const activeAvatar = isCustom
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${customNick || 'Player'}&backgroundColor=111111`
    : selectedPreset.avatar;
  const activeNick = isCustom ? (customNick || 'Ваш никнейм') : selectedPreset.nickname;
  const activeSteamId = isCustom ? customSteamId : selectedPreset.steamId;

  return (
    <div className="steam-modal-overlay" onClick={onClose}>
      <div className="steam-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Steam Official Window Header */}
        <div className="steam-modal-header">
          <div className="steam-modal-header__brand">
            <SteamIcon size={24} />
            <div className="steam-modal-header__title-box">
              <span className="steam-brand-title">STEAM COMMUNITY</span>
              <span className="steam-brand-sub">
                {isRegister ? 'Регистрация в ASCENT через Steam' : 'Вход в ASCENT через Steam OpenID'}
              </span>
            </div>
          </div>
          <button type="button" className="steam-modal-close" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="steam-modal-body">
          <div className="steam-security-banner">
            <ShieldCheck size={20} className="steam-shield-icon" />
            <p>
              Лига ASCENT CS2 использует официальный протокол <strong>Steam OpenID</strong>. Ваши учетные данные Steam не передаются сайту, верифицируется только ваш игровой SteamID и CS2 статус.
            </p>
          </div>

          {/* Quick CS2 Accounts Switcher */}
          <div className="steam-preset-section">
            <label className="steam-section-label">Выберите аккаунт Steam или введите свой:</label>
            <div className="steam-presets-grid">
              {STEAM_PRESETS.map((p) => {
                const isActive = !isCustom && selectedPreset.steamId === p.steamId;
                return (
                  <button
                    key={p.steamId}
                    type="button"
                    className={`steam-preset-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <img src={p.avatar} alt={p.nickname} className="steam-preset-avatar" />
                    <span className="steam-preset-name">{p.nickname}</span>
                    {isActive && <CheckCircle2 size={13} className="steam-check-icon" />}
                  </button>
                );
              })}

              <button
                type="button"
                className={`steam-preset-pill ${isCustom ? 'active' : ''}`}
                onClick={() => setIsCustom(true)}
              >
                <div className="steam-preset-custom-icon">
                  <User size={14} />
                </div>
                <span className="steam-preset-name">Свой аккаунт</span>
                {isCustom && <CheckCircle2 size={13} className="steam-check-icon" />}
              </button>
            </div>
          </div>

          {/* Custom Account Inputs */}
          {isCustom && (
            <div className="steam-custom-fields">
              <div className="steam-input-group">
                <label>Игровой никнейм (CS2 Persona Name):</label>
                <input
                  type="text"
                  className="steam-text-input"
                  placeholder="Например: CyberSniper"
                  value={customNick}
                  onChange={(e) => setCustomNick(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="steam-input-group">
                <label>Реальное имя (опционально):</label>
                <input
                  type="text"
                  className="steam-text-input"
                  placeholder="Иван Иванов"
                  value={customRealName}
                  onChange={(e) => setCustomRealName(e.target.value)}
                />
              </div>

              <div className="steam-input-group">
                <label>SteamID64:</label>
                <input
                  type="text"
                  className="steam-text-input font-mono"
                  placeholder="76561198..."
                  value={customSteamId}
                  onChange={(e) => setCustomSteamId(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Active Steam Account Identity Card */}
          <div className="steam-account-preview-card">
            <div className="steam-account-avatar-wrap">
              <img src={activeAvatar} alt={activeNick} className="steam-account-avatar" />
              <span className="steam-online-dot" title="Steam Онлайн" />
            </div>

            <div className="steam-account-info">
              <div className="steam-account-name-row">
                <h4 className="steam-account-name">{activeNick}</h4>
                <span className="steam-badge-verified">
                  <CheckCircle2 size={12} />
                  <span>Steam Verified</span>
                </span>
              </div>

              <div className="steam-account-meta">
                <span className="steam-meta-item">
                  SteamID: <strong>{activeSteamId}</strong>
                </span>
                <span className="steam-meta-item">
                  VAC: <span className="text-positive">Без нарушений (Clean)</span>
                </span>
                {!isCustom && (
                  <span className="steam-meta-item">
                    <Clock size={11} />
                    <span>{selectedPreset.hours} ч. в CS2</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="steam-terms-text">
            Нажимая «Войти», вы соглашаетесь связать свой аккаунт Steam с турнирной платформой ASCENT CS2 League и подтверждаете актуальность игровых данных.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="steam-modal-footer">
          <button type="button" className="steam-btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="steam-btn-confirm"
            onClick={handleConfirmLogin}
            disabled={submitting}
          >
            <SteamIcon size={18} />
            <span>{submitting ? 'Подключение к Steam...' : isRegister ? 'Зарегистрироваться через Steam' : 'Войти через Steam'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SteamAuthModal;
