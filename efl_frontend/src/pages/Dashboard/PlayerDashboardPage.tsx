import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Shield,
  Activity,
  Sliders,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Save,
  Crosshair,
  Keyboard,
  ArrowUpRight,
  CheckCircle2,
  Camera,
  Upload,
  X,
  Swords,
  Globe,
  Flame,
  CheckSquare
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import CoinIcon from '@/components/ui/CoinIcon/CoinIcon';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import CountryFlag from '@/components/ui/CountryFlag/CountryFlag';
import './PlayerDashboardPage.css';

type DashboardTab = 'overview' | 'profile' | 'config' | 'gear' | 'accounts' | 'matches';

const COUNTRIES = [
  { code: 'ru', name: 'Россия' },
  { code: 'ua', name: 'Украина' },
  { code: 'kz', name: 'Казахстан' },
  { code: 'by', name: 'Беларусь' },
  { code: 'fr', name: 'Франция' },
  { code: 'dk', name: 'Дания' },
  { code: 'se', name: 'Швеция' },
  { code: 'de', name: 'Германия' },
  { code: 'br', name: 'Бразилия' },
  { code: 'us', name: 'США' },
  { code: 'pl', name: 'Польша' },
  { code: 'tr', name: 'Турция' },
  { code: 'gb', name: 'Великобритания' },
  { code: 'ee', name: 'Эстония' },
  { code: 'fi', name: 'Финляндия' },
  { code: 'ba', name: 'Босния и Герцеговина' },
  { code: 'sk', name: 'Словакия' },
  { code: 'il', name: 'Израиль' },
  { code: 'mn', name: 'Монголия' },
];

const ROLES = [
  'AWP Снайпер',
  'Капитан / IGL',
  'Энтри-фраггер',
  'Стар Рифлер',
  'Опорник / Саппорт'
];

const WEAPONS = ['AK-47', 'AWP', 'M4A1-S', 'M4A4', 'Desert Eagle', 'Galil AR', 'MP9'];
const MAPS = ['Mirage', 'Inferno', 'Nuke', 'Dust II', 'Ancient', 'Anubis'];

const PRO_CROSSHAIRS = [
  { player: 'donk', code: 'CSGO-jU5mS-dY9dE-r254U-2vG2h-3243F' },
  { player: 's1mple', code: 'CSGO-UwUWb-e6W6S-8vWvM-2UqU2-7Z2aC' },
  { player: 'm0NESY', code: 'CSGO-wJwG8-98eDk-VwE2k-9k8eF-3QvK9' },
  { player: 'NiKo', code: 'CSGO-tZ5mS-dY9dE-r254U-2vG2h-3243F' },
  { player: 'ZywOo', code: 'CSGO-Qzpx5-BDehc-ReaTd-Aroxd-L3P8a' },
  { player: 'b1t', code: 'CSGO-9O2X8-VwE2k-9k8eF-3QvK9-O28aC' },
];

const PRESET_AVATARS = [
  { name: 'Alexander (Pro)', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80' },
  { name: 'Cyber Ghost', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { name: 'Viper Strike', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { name: 'Titan CS', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { name: 'Shadow Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowGhost&backgroundColor=111111' },
  { name: 'Blaze Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BlazeMaster&backgroundColor=111111' },
];

const PlayerDashboardPage: React.FC = () => {
  const { currentUser, loginWithSteam, logoutUser, updateUserProfile, teams, matches, openWallet, marketBalance } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as DashboardTab | null;
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    queryTab && ['overview', 'profile', 'config', 'gear', 'accounts', 'matches'].includes(queryTab)
      ? queryTab
      : 'overview'
  );

  useEffect(() => {
    if (queryTab && ['overview', 'profile', 'config', 'gear', 'accounts', 'matches'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [copiedCrosshair, setCopiedCrosshair] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const [checkedInMatches, setCheckedInMatches] = useState<Record<string, boolean>>({});
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Comprehensive Player Form State
  const [formData, setFormData] = useState({
    nickname: currentUser?.nickname || 'BlazeMaster',
    realName: currentUser?.realName || 'Alexander Vance',
    email: currentUser?.email || 'captain@phoenix.gg',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    country: currentUser?.country || 'ru',
    gameRole: currentUser?.gameRole || 'Капитан / IGL',
    playerStatus: currentUser?.playerStatus || 'active',
    teamName: currentUser?.teamName || 'Phoenix Rising',
    teamSlug: currentUser?.teamSlug || 'phoenix-rising',
    role: currentUser?.role || 'captain',
    age: currentUser?.age || 22,
    bio: currentUser?.bio || 'Капитан и энтри-фраггер команды Phoenix Rising. Участник первого сезона лиги ASCENT CS2.',

    // Steam & Socials
    steamId: currentUser?.steamId || '76561198299104812',
    steamUrl: currentUser?.steamUrl || 'https://steamcommunity.com/id/blazemaster',
    tradeUrl: currentUser?.tradeUrl || 'https://steamcommunity.com/tradeoffer/new/?partner=338839084&token=A8bX2c9',
    faceitUrl: currentUser?.faceitUrl || 'https://faceit.com/en/players/blazemaster',
    faceitElo: currentUser?.faceitElo || 2450,
    faceitLevel: currentUser?.faceitLevel || 10,
    twitchUrl: currentUser?.twitchUrl || 'https://twitch.tv/blazemaster_cs',
    twitterUrl: currentUser?.twitterUrl || 'https://x.com/blazemaster',
    discordTag: currentUser?.discordTag || 'blazemaster#1337',
    telegramUrl: currentUser?.telegramUrl || 'https://t.me/blazemaster_cs',

    // CS2 Settings
    crosshairCode: currentUser?.crosshairCode || 'CSGO-7O2X8-VwE2k-9k8eF-3QvK9-O28aC',
    dpi: currentUser?.dpi || 800,
    sensitivity: currentUser?.sensitivity || 1.15,
    zoomSensitivity: currentUser?.zoomSensitivity || 1.0,
    hz: currentUser?.hz || 1000,
    resolution: currentUser?.resolution || '1280x960',
    aspectRatio: currentUser?.aspectRatio || '4:3',
    scalingMode: currentUser?.scalingMode || 'Stretched',
    launchOptions: currentUser?.launchOptions || '-novid -tickrate 128 -freq 360 +fps_max 0',

    // Gear
    mouse: currentUser?.mouse || 'Logitech G Pro X Superlight 2',
    mousepad: currentUser?.mousepad || 'Artisan Hayate Otsu FX Soft XL',
    keyboard: currentUser?.keyboard || 'Wooting 60HE (Rapid Trigger)',
    headset: currentUser?.headset || 'HyperX Cloud II Wireless',
    monitor: currentUser?.monitor || 'ZOWIE XL2566K (360Hz DyAc+)',
    favoriteWeapon: currentUser?.favoriteWeapon || 'AK-47',
    favoriteMap: currentUser?.favoriteMap || 'Mirage',
  });

  // Sync state if currentUser changes from outside
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        nickname: currentUser.nickname,
        realName: currentUser.realName || prev.realName,
        email: currentUser.email || prev.email,
        avatar: currentUser.avatar || prev.avatar,
        country: currentUser.country || prev.country,
        gameRole: currentUser.gameRole || prev.gameRole,
        playerStatus: currentUser.playerStatus || prev.playerStatus,
        teamName: currentUser.teamName || prev.teamName,
        teamSlug: currentUser.teamSlug || prev.teamSlug,
        role: currentUser.role || prev.role,
        age: currentUser.age || prev.age,
        bio: currentUser.bio || prev.bio,
        steamId: currentUser.steamId || prev.steamId,
        steamUrl: currentUser.steamUrl || prev.steamUrl,
        tradeUrl: currentUser.tradeUrl || prev.tradeUrl,
        faceitUrl: currentUser.faceitUrl || prev.faceitUrl,
        faceitElo: currentUser.faceitElo || prev.faceitElo,
        faceitLevel: currentUser.faceitLevel || prev.faceitLevel,
        twitchUrl: currentUser.twitchUrl || prev.twitchUrl,
        twitterUrl: currentUser.twitterUrl || prev.twitterUrl,
        discordTag: currentUser.discordTag || prev.discordTag,
        telegramUrl: currentUser.telegramUrl || prev.telegramUrl,
        crosshairCode: currentUser.crosshairCode || prev.crosshairCode,
        dpi: currentUser.dpi || prev.dpi,
        sensitivity: currentUser.sensitivity || prev.sensitivity,
        zoomSensitivity: currentUser.zoomSensitivity || prev.zoomSensitivity,
        hz: currentUser.hz || prev.hz,
        resolution: currentUser.resolution || prev.resolution,
        aspectRatio: currentUser.aspectRatio || prev.aspectRatio,
        scalingMode: currentUser.scalingMode || prev.scalingMode,
        launchOptions: currentUser.launchOptions || prev.launchOptions,
        mouse: currentUser.mouse || prev.mouse,
        mousepad: currentUser.mousepad || prev.mousepad,
        keyboard: currentUser.keyboard || prev.keyboard,
        headset: currentUser.headset || prev.headset,
        monitor: currentUser.monitor || prev.monitor,
        favoriteWeapon: currentUser.favoriteWeapon || prev.favoriteWeapon,
        favoriteMap: currentUser.favoriteMap || prev.favoriteMap,
      }));
    }
  }, [currentUser]);

  const updateField = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUserProfile(formData);
    setHasUnsavedChanges(false);
    showToast('Все параметры профиля успешно сохранены!', 'success');
  };

  const handleResetForm = () => {
    if (!currentUser) return;
    setFormData({
      nickname: currentUser.nickname,
      realName: currentUser.realName || '',
      email: currentUser.email || '',
      avatar: currentUser.avatar || '',
      country: currentUser.country || 'ru',
      gameRole: currentUser.gameRole || 'Стар Рифлер',
      playerStatus: currentUser.playerStatus || 'active',
      teamName: currentUser.teamName || '',
      teamSlug: currentUser.teamSlug || '',
      role: currentUser.role || 'player',
      age: currentUser.age || 20,
      bio: currentUser.bio || '',
      steamId: currentUser.steamId || '',
      steamUrl: currentUser.steamUrl || '',
      tradeUrl: currentUser.tradeUrl || '',
      faceitUrl: currentUser.faceitUrl || '',
      faceitElo: currentUser.faceitElo || 2000,
      faceitLevel: currentUser.faceitLevel || 10,
      twitchUrl: currentUser.twitchUrl || '',
      twitterUrl: currentUser.twitterUrl || '',
      discordTag: currentUser.discordTag || '',
      telegramUrl: currentUser.telegramUrl || '',
      crosshairCode: currentUser.crosshairCode || '',
      dpi: currentUser.dpi || 800,
      sensitivity: currentUser.sensitivity || 1.15,
      zoomSensitivity: currentUser.zoomSensitivity || 1.0,
      hz: currentUser.hz || 1000,
      resolution: currentUser.resolution || '1280x960',
      aspectRatio: currentUser.aspectRatio || '4:3',
      scalingMode: currentUser.scalingMode || 'Stretched',
      launchOptions: currentUser.launchOptions || '-novid -tickrate 128 -freq 360',
      mouse: currentUser.mouse || '',
      mousepad: currentUser.mousepad || '',
      keyboard: currentUser.keyboard || '',
      headset: currentUser.headset || '',
      monitor: currentUser.monitor || '',
      favoriteWeapon: currentUser.favoriteWeapon || 'AK-47',
      favoriteMap: currentUser.favoriteMap || 'Mirage',
    });
    setHasUnsavedChanges(false);
    showToast('Изменения сброшены', 'info');
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Размер изображения не должен превышать 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateField('avatar', result);
        updateUserProfile({ avatar: result });
        setShowAvatarModal(false);
        showToast('Фото профиля обновлено!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    updateField('avatar', url);
    updateUserProfile({ avatar: url });
    setShowAvatarModal(false);
    showToast('Аватар обновлен из библиотеки!', 'success');
  };

  const handleApplyAvatarUrl = () => {
    if (!avatarUrlInput.trim()) {
      showToast('Пожалуйста, введите URL изображения.', 'error');
      return;
    }
    updateField('avatar', avatarUrlInput.trim());
    updateUserProfile({ avatar: avatarUrlInput.trim() });
    setShowAvatarModal(false);
    setAvatarUrlInput('');
    showToast('Аватар обновлен по ссылке!', 'success');
  };

  const handleCopyCrosshair = () => {
    if (formData.crosshairCode) {
      navigator.clipboard.writeText(formData.crosshairCode);
      setCopiedCrosshair(true);
      showToast('Код прицела CS2 скопирован в буфер!', 'success');
      setTimeout(() => setCopiedCrosshair(false), 2500);
    }
  };

  const handleCopyProfileLink = () => {
    const publicUrl = `${window.location.origin}/players/${formData.nickname.toLowerCase()}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedProfileLink(true);
    showToast('Ссылка на публичный профиль скопирована!', 'success');
    setTimeout(() => setCopiedProfileLink(false), 2200);
  };

  const handleCheckIn = (matchId: string) => {
    setCheckedInMatches((prev) => ({ ...prev, [matchId]: true }));
    showToast('Готовность подтверждена! Чекин отправлен судейскому серверу.', 'success');
  };

  const handleLogout = () => {
    logoutUser();
    showToast('Вы вышли из учетной записи.', 'info');
    navigate('/login');
  };

  const userTeam = useMemo(() => {
    if (!formData.teamSlug) return null;
    return teams.find((t) => t.slug === formData.teamSlug || t.name.toLowerCase() === formData.teamName?.toLowerCase()) || null;
  }, [teams, formData.teamSlug, formData.teamName]);

  const teamMatches = useMemo(() => {
    if (!userTeam) return [];
    return matches.filter((m) => m.teamA.toLowerCase() === userTeam.name.toLowerCase() || m.teamB.toLowerCase() === userTeam.name.toLowerCase());
  }, [matches, userTeam]);

  const eDpi = Math.round((Number(formData.dpi) || 800) * (Number(formData.sensitivity) || 1));

  if (!currentUser) {
    return (
      <section className="dashboard-page">
        <div className="container">
          <div className="panel tp-not-found" style={{ padding: 'var(--space-8)' }}>
            <User size={48} className="text-tertiary" style={{ margin: '0 auto 1rem' }} />
            <h2>Личный кабинет игрока</h2>
            <p className="text-secondary" style={{ maxWidth: 460, margin: '0.5rem auto 1.5rem' }}>
              Для настройки всех параметров профиля, конфига CS2 и привязки Steam выполните авторизацию.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="steam-main-auth-btn"
                style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
                onClick={() => {
                  loginWithSteam({
                    nickname: 'BlazeMaster',
                    realName: 'Alexander Vance',
                    steamId: '76561198299104812',
                    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
                    country: 'ru',
                    teamName: 'Phoenix Rising',
                    teamSlug: 'phoenix-rising',
                    role: 'captain',
                  });
                  showToast('Успешный вход через Steam!', 'success');
                }}
              >
                <SteamIcon size={20} />
                <span>Войти через Steam</span>
              </button>
              <Link to="/login" className="btn-outline" style={{ display: 'inline-flex', padding: '0.65rem 1.25rem' }}>
                Вход по почте
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        {/* Breadcrumb Navigation — native ASCENT style */}
        <div className="dashboard-breadcrumb">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/stats?tab=players">Игроки</Link>
          <span>/</span>
          <span>Личный кабинет ({formData.nickname})</span>
        </div>

        {/* Hero Card — unified with PlayerProfilePage pp-hero */}
        <div className="panel pp-hero dashboard-hero">
          <div className="pp-hero__left">
            <div className="dashboard-avatar-wrapper">
              <div
                className="dashboard-avatar"
                onClick={() => setShowAvatarModal(true)}
                title="Нажмите, чтобы изменить фото профиля или Steam аватар"
              >
                <img src={formData.avatar} alt={formData.nickname} />
                <div className="dashboard-avatar-overlay">
                  <Camera size={22} />
                  <span>Фото</span>
                </div>
              </div>
              <button
                type="button"
                className="dashboard-avatar-edit-btn"
                onClick={() => setShowAvatarModal(true)}
                title="Сменить аватар"
              >
                <Camera size={13} />
              </button>
            </div>

            <div className="pp-hero__identity">
              <div className="pp-hero__name-row">
                <CountryFlag code={formData.country} size="md" />
                <h1 className="pp-nickname">{formData.nickname}</h1>
                {formData.teamName && (
                  <span className="pp-meta-tag">
                    <Shield size={13} />
                    <span>{formData.teamName}</span>
                  </span>
                )}
                {currentUser.isSteamVerified && (
                  <span className="pp-meta-tag">
                    <SteamIcon size={13} />
                    <span>Steam Verified</span>
                  </span>
                )}
              </div>

              <div className="pp-meta-row">
                {formData.realName && (
                  <span className="pp-meta-tag">
                    <User size={13} />
                    <span>{formData.realName}</span>
                  </span>
                )}
                <span className="pp-meta-tag pp-meta-tag--role">
                  <Flame size={13} />
                  <span>{formData.gameRole}</span>
                </span>
                <span className="pp-meta-tag">
                  <span>Статус: <strong>{formData.playerStatus === 'active' ? 'В составе' : formData.playerStatus === 'lft' ? 'Ищет команду (LFT)' : 'В запасе'}</strong></span>
                </span>
                {formData.age && (
                  <span className="pp-meta-tag">
                    <span>{formData.age} лет</span>
                  </span>
                )}
              </div>

              {/* Actions row */}
              <div className="pp-socials-row">
                <Link
                  to={`/players/${formData.nickname.toLowerCase()}`}
                  className="pp-social-btn"
                  title="Открыть публичную страницу"
                >
                  <ArrowUpRight size={13} />
                  <span>Публичный профиль</span>
                </Link>

                <button
                  type="button"
                  className="pp-social-btn"
                  onClick={handleCopyProfileLink}
                >
                  {copiedProfileLink ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedProfileLink ? 'Скопировано' : 'Ссылка на профиль'}</span>
                </button>

                <button
                  type="button"
                  className="pp-social-btn"
                  onClick={openWallet}
                >
                  <CoinIcon size={13} />
                  <span>Кошелёк ({marketBalance.toLocaleString()} AC)</span>
                </button>

                <button
                  type="button"
                  className="pp-social-btn dashboard-btn-logout"
                  onClick={handleLogout}
                  title="Выйти из аккаунта"
                >
                  <LogOut size={13} />
                  <span>Выход</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Highlight Stat Cards */}
          <div className="pp-hero__stats-cards">
            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">РЕЙТИНГ ASCENT</span>
              <span className="pp-highlight-stat__value" style={{ color: 'var(--tier-t1)' }}>
                {currentUser.ratingEfl || 1.34}
              </span>
              <span className="pp-highlight-stat__sub">сезонный рейтинг</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">eDPI СЕНСА</span>
              <span className="pp-highlight-stat__value">
                {eDpi}
              </span>
              <span className="pp-highlight-stat__sub">{formData.dpi} DPI × {formData.sensitivity}</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">FACEIT ELO</span>
              <span className="pp-highlight-stat__value" style={{ color: '#f97316' }}>
                {formData.faceitElo}
              </span>
              <span className="pp-highlight-stat__sub">Уровень {formData.faceitLevel} LVL</span>
            </div>

            <div className="pp-highlight-stat">
              <span className="pp-highlight-stat__label">БАЛАНС AC</span>
              <span className="pp-highlight-stat__value" style={{ color: 'var(--accent-positive)' }}>
                {marketBalance.toLocaleString()}
              </span>
              <span className="pp-highlight-stat__sub">монет на счете</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation — native ASCENT tabs */}
        <div className="tabs-header dashboard-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleSelectTab('overview')}
          >
            <Activity size={16} />
            <span>Обзор профиля</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleSelectTab('profile')}
          >
            <User size={16} />
            <span>Личные данные</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => handleSelectTab('config')}
          >
            <Crosshair size={16} />
            <span>Конфиг CS2 и Прицел</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gear' ? 'active' : ''}`}
            onClick={() => handleSelectTab('gear')}
          >
            <Keyboard size={16} />
            <span>Девайсы и Железо</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => handleSelectTab('accounts')}
          >
            <SteamIcon size={16} />
            <span>Steam и Соцсети</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => handleSelectTab('matches')}
          >
            <Swords size={16} />
            <span>Матчи и Чекин</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: ОБЗОР ПРОФИЛЯ
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="dashboard-tab-content">
            {/* Bio Panel */}
            <div className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 className="pp-section-title" style={{ margin: 0 }}>
                  <User size={20} />
                  <span>О себе</span>
                </h3>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  onClick={() => setActiveTab('profile')}
                >
                  <Sliders size={12} />
                  <span>Редактировать</span>
                </button>
              </div>
              <p className="text-secondary" style={{ lineHeight: 1.6 }}>
                {formData.bio || 'Описание профиля пока не заполнено.'}
              </p>
            </div>

            {/* Split 2-Column: CS2 Config Preview & Gear Preview */}
            <div className="pp-grid-2col">
              {/* CS2 Quick Settings */}
              <div className="panel pp-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Crosshair size={20} />
                    <span>Конфиг CS2</span>
                  </h3>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => setActiveTab('config')}
                  >
                    Настроить
                  </button>
                </div>

                <div className="dashboard-specs-grid">
                  <div className="dashboard-spec-box">
                    <span className="spec-label">eDPI</span>
                    <span className="spec-val font-mono">{eDpi}</span>
                  </div>
                  <div className="dashboard-spec-box">
                    <span className="spec-label">Сенса</span>
                    <span className="spec-val font-mono">{formData.sensitivity}</span>
                  </div>
                  <div className="dashboard-spec-box">
                    <span className="spec-label">DPI</span>
                    <span className="spec-val font-mono">{formData.dpi}</span>
                  </div>
                  <div className="dashboard-spec-box">
                    <span className="spec-label">Частота</span>
                    <span className="spec-val font-mono">{formData.hz}Hz</span>
                  </div>
                  <div className="dashboard-spec-box">
                    <span className="spec-label">Разрешение</span>
                    <span className="spec-val font-mono">{formData.resolution}</span>
                  </div>
                  <div className="dashboard-spec-box">
                    <span className="spec-label">Формат</span>
                    <span className="spec-val font-mono">{formData.aspectRatio} {formData.scalingMode}</span>
                  </div>
                </div>

                {/* Crosshair Copy Box */}
                <div className="dashboard-crosshair-preview-box">
                  <div className="crosshair-preview-header">
                    <span className="text-secondary text-xs font-semibold">ПРИЦЕЛ CS2 (SHARE CODE):</span>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      onClick={handleCopyCrosshair}
                    >
                      {copiedCrosshair ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCrosshair ? 'Скопировано!' : 'Скопировать'}</span>
                    </button>
                  </div>
                  <div className="crosshair-code-row">
                    <code>{formData.crosshairCode}</code>
                  </div>
                </div>
              </div>

              {/* Hardware & Peripherals */}
              <div className="panel pp-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Keyboard size={20} />
                    <span>Девайсы игрока</span>
                  </h3>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => setActiveTab('gear')}
                  >
                    Изменить
                  </button>
                </div>

                <div className="dashboard-gear-list">
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Мышь:</span>
                    <span className="gear-name">{formData.mouse || 'Не указана'}</span>
                  </div>
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Коврик:</span>
                    <span className="gear-name">{formData.mousepad || 'Не указан'}</span>
                  </div>
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Клавиатура:</span>
                    <span className="gear-name">{formData.keyboard || 'Не указана'}</span>
                  </div>
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Наушники:</span>
                    <span className="gear-name">{formData.headset || 'Не указаны'}</span>
                  </div>
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Монитор:</span>
                    <span className="gear-name">{formData.monitor || 'Не указан'}</span>
                  </div>
                  <div className="dashboard-gear-row">
                    <span className="gear-type">Любимое оружие:</span>
                    <span className="gear-name" style={{ color: 'var(--accent-positive)' }}>{formData.favoriteWeapon}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Accounts Status */}
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Globe size={20} />
                <span>Привязанные платформы</span>
              </h3>

              <div className="dashboard-platforms-grid">
                <div className="dashboard-platform-card">
                  <div className="platform-card-header">
                    <SteamIcon size={20} />
                    <span className="platform-title">Steam OpenID</span>
                  </div>
                  <span className="platform-status-pill text-positive">Верифицирован</span>
                  <span className="platform-sub font-mono">{formData.steamId}</span>
                </div>

                <div className="dashboard-platform-card">
                  <div className="platform-card-header">
                    <Flame size={20} style={{ color: '#f97316' }} />
                    <span className="platform-title">FACEIT</span>
                  </div>
                  <span className="platform-status-pill">{formData.faceitElo} ELO (LVL {formData.faceitLevel})</span>
                  <a href={formData.faceitUrl} target="_blank" rel="noopener noreferrer" className="platform-link">
                    <span>Профиль</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="dashboard-platform-card">
                  <div className="platform-card-header">
                    <Activity size={20} style={{ color: '#a855f7' }} />
                    <span className="platform-title">Twitch Stream</span>
                  </div>
                  <span className="platform-status-pill">{formData.twitchUrl ? 'Подключен' : 'Не указан'}</span>
                  {formData.twitchUrl && (
                    <a href={formData.twitchUrl} target="_blank" rel="noopener noreferrer" className="platform-link">
                      <span>Канал</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="dashboard-platform-card">
                  <div className="platform-card-header">
                    <Shield size={20} style={{ color: '#3b82f6' }} />
                    <span className="platform-title">Команда</span>
                  </div>
                  <span className="platform-status-pill">{formData.teamName || 'Свободный агент'}</span>
                  <span className="platform-sub">{formData.role === 'captain' ? 'Капитан команды' : 'Игрок состава'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ЛИЧНЫЕ ДАННЫЕ (РЕДАКТИРОВАНИЕ)
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="dashboard-tab-content">
            <form onSubmit={handleSaveProfile} className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <User size={20} />
                    <span>Настройка основных данных игрока</span>
                  </h3>
                  <span className="text-secondary text-xs">
                    Измените отображаемую информацию в турнирах и публичном профиле ASCENT
                  </span>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  <Save size={15} />
                  <span>Сохранить профиль</span>
                </button>
              </div>

              <div className="dashboard-form-grid">
                {/* Nickname */}
                <div className="form-field">
                  <label className="form-label">Игровой никнейм (Nickname)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.nickname}
                    onChange={(e) => updateField('nickname', e.target.value)}
                    required
                  />
                  <span className="text-tertiary text-xs">Отображается в турнирных сетках и таблицах лидеров.</span>
                </div>

                {/* Real Name */}
                <div className="form-field">
                  <label className="form-label">Настоящее имя (Real Name)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.realName}
                    onChange={(e) => updateField('realName', e.target.value)}
                    placeholder="Например: Александр Соколов"
                  />
                </div>

                {/* Country Flag Selector */}
                <div className="form-field">
                  <label className="form-label">Страна и национальный флаг</label>
                  <select
                    className="input-field"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age */}
                <div className="form-field">
                  <label className="form-label">Возраст (лет)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.age}
                    onChange={(e) => updateField('age', Number(e.target.value))}
                    min={12}
                    max={60}
                  />
                </div>

                {/* Game Role */}
                <div className="form-field">
                  <label className="form-label">Игровая роль в CS2</label>
                  <select
                    className="input-field"
                    value={formData.gameRole}
                    onChange={(e) => updateField('gameRole', e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Player Status */}
                <div className="form-field">
                  <label className="form-label">Турнирный статус</label>
                  <select
                    className="input-field"
                    value={formData.playerStatus}
                    onChange={(e) => updateField('playerStatus', e.target.value)}
                  >
                    <option value="active">В активном составе команды</option>
                    <option value="lft">Ищет команду (Looking for Team / LFT)</option>
                    <option value="reserve">В запасе (Inactive / Substitute)</option>
                  </select>
                </div>

                {/* Team Selection */}
                <div className="form-field">
                  <label className="form-label">Команда (Клуб)</label>
                  <select
                    className="input-field"
                    value={formData.teamSlug}
                    onChange={(e) => {
                      const selSlug = e.target.value;
                      const selTeam = teams.find((t) => t.slug === selSlug);
                      updateField('teamSlug', selSlug);
                      updateField('teamName', selTeam ? selTeam.name : 'Свободный агент');
                    }}
                  >
                    <option value="">Без команды (Свободный агент)</option>
                    {teams.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name} [{t.tier}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role in Team */}
                <div className="form-field">
                  <label className="form-label">Должность в команде</label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value as any)}
                  >
                    <option value="captain">Капитан команды (Team Captain)</option>
                    <option value="player">Игрок основного состава</option>
                  </select>
                </div>
              </div>

              {/* Bio Field */}
              <div className="form-field" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">О себе / Биография игрока</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Расскажите о своем соревновательном опыте, целях и достижениях..."
                />
              </div>

              {/* Avatar Configuration Section */}
              <div className="dashboard-avatar-picker-section">
                <span className="form-label">Аватар соревновательного профиля</span>
                <div className="avatar-picker-row">
                  <div className="avatar-current-preview">
                    <img src={formData.avatar} alt="Current" />
                  </div>
                  <div className="avatar-picker-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setShowAvatarModal(true)}
                    >
                      <Camera size={14} />
                      <span>Выбрать из галереи или загрузить</span>
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => {
                        const steamAvatar = `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`;
                        updateField('avatar', steamAvatar);
                        showToast('Аватар синхронизирован со Steam!', 'info');
                      }}
                    >
                      <SteamIcon size={14} />
                      <span>Синхронизировать со Steam</span>
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="button" className="btn-outline" onClick={handleResetForm}>
                  Сбросить
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>
                  <Save size={15} />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 3: КОНФИГ CS2 И ПРИЦЕЛ
            ========================================================================= */}
        {activeTab === 'config' && (
          <div className="dashboard-tab-content">
            <form onSubmit={handleSaveProfile} className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Crosshair size={20} />
                    <span>Настройки CS2 и Прицел</span>
                  </h3>
                  <span className="text-secondary text-xs">
                    Точные параметры чувствительности, разрешения и код прицела
                  </span>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  <Save size={15} />
                  <span>Сохранить конфиг</span>
                </button>
              </div>

              {/* Crosshair Editor & Presets */}
              <div className="dashboard-crosshair-editor-card">
                <div className="crosshair-editor-top">
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#fff' }}>Прицел CS2 (Crosshair Code)</h4>
                    <span className="text-secondary text-xs">
                      Вставьте код из игры или выберите готовый прицел киберспортсмена
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={handleCopyCrosshair}
                  >
                    {copiedCrosshair ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCrosshair ? 'Код скопирован!' : 'Скопировать код'}</span>
                  </button>
                </div>

                <div className="crosshair-input-row">
                  <input
                    type="text"
                    className="input-field font-mono"
                    value={formData.crosshairCode}
                    onChange={(e) => updateField('crosshairCode', e.target.value)}
                    placeholder="CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  />
                </div>

                {/* Quick Pro Crosshairs Buttons */}
                <div className="pro-crosshairs-section">
                  <span className="text-secondary text-xs font-semibold">Пресеты прицелов про-игроков:</span>
                  <div className="pro-crosshairs-buttons">
                    {PRO_CROSSHAIRS.map((pro) => (
                      <button
                        key={pro.player}
                        type="button"
                        className={`pro-crosshair-btn ${formData.crosshairCode === pro.code ? 'active' : ''}`}
                        onClick={() => {
                          updateField('crosshairCode', pro.code);
                          showToast(`Применен прицел ${pro.player}!`, 'info');
                        }}
                      >
                        <span>{pro.player}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mouse Sensitivity & eDPI Grid */}
              <div className="dashboard-form-grid" style={{ marginTop: 'var(--space-6)' }}>
                <div className="form-field">
                  <label className="form-label">
                    Чувствительность мыши (In-game Sensitivity)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0.4"
                      max="4.0"
                      step="0.05"
                      value={formData.sensitivity}
                      onChange={(e) => updateField('sensitivity', parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--accent-neutral)' }}
                    />
                    <input
                      type="number"
                      className="input-field font-mono"
                      style={{ width: '85px', textAlign: 'center' }}
                      step="0.01"
                      min="0.1"
                      max="10.0"
                      value={formData.sensitivity}
                      onChange={(e) => updateField('sensitivity', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">DPI Мыши</label>
                  <select
                    className="input-field"
                    value={formData.dpi}
                    onChange={(e) => updateField('dpi', parseInt(e.target.value, 10))}
                  >
                    <option value={400}>400 DPI</option>
                    <option value={800}>800 DPI</option>
                    <option value={1200}>1200 DPI</option>
                    <option value={1600}>1600 DPI</option>
                    <option value={3200}>3200 DPI</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Zoom Sensitivity (Прицел)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="input-field font-mono"
                    value={formData.zoomSensitivity}
                    onChange={(e) => updateField('zoomSensitivity', parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Частота опроса (Hz)</label>
                  <select
                    className="input-field"
                    value={formData.hz}
                    onChange={(e) => updateField('hz', parseInt(e.target.value, 10))}
                  >
                    <option value={1000}>1000 Hz</option>
                    <option value={2000}>2000 Hz</option>
                    <option value={4000}>4000 Hz</option>
                    <option value={8000}>8000 Hz</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Разрешение экрана</label>
                  <select
                    className="input-field font-mono"
                    value={formData.resolution}
                    onChange={(e) => updateField('resolution', e.target.value)}
                  >
                    <option value="1280x960">1280x960 (4:3)</option>
                    <option value="1920x1080">1920x1080 (16:9 Full HD)</option>
                    <option value="1024x768">1024x768 (4:3 Classic)</option>
                    <option value="1440x1080">1440x1080 (4:3 Custom)</option>
                    <option value="1280x1024">1280x1024 (5:4)</option>
                    <option value="2560x1440">2560x1440 (16:9 2K QHD)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Масштабирование (Scaling Mode)</label>
                  <select
                    className="input-field"
                    value={formData.scalingMode}
                    onChange={(e) => updateField('scalingMode', e.target.value)}
                  >
                    <option value="Stretched">Растянутое (Stretched)</option>
                    <option value="Black Bars">Полосы по бокам (Black Bars)</option>
                    <option value="Native">Нативное (Native)</option>
                  </select>
                </div>
              </div>

              {/* Launch Options */}
              <div className="form-field" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Параметры запуска CS2 (Launch Options)</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  value={formData.launchOptions}
                  onChange={(e) => updateField('launchOptions', e.target.value)}
                  placeholder="-novid -tickrate 128 -freq 360 +fps_max 0"
                />
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>
                  <Save size={15} />
                  <span>Сохранить конфиг</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 4: ДЕВАЙСЫ И ЖЕЛЕЗО
            ========================================================================= */}
        {activeTab === 'gear' && (
          <div className="dashboard-tab-content">
            <form onSubmit={handleSaveProfile} className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <Keyboard size={20} />
                    <span>Игровые девайсы и периферия</span>
                  </h3>
                  <span className="text-secondary text-xs">
                    Укажите свои соревновательные девайсы для отображения в профиле
                  </span>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  <Save size={15} />
                  <span>Сохранить девайсы</span>
                </button>
              </div>

              <div className="dashboard-form-grid">
                <div className="form-field">
                  <label className="form-label">Игровая мышь (Mouse)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.mouse}
                    onChange={(e) => updateField('mouse', e.target.value)}
                    placeholder="Logitech G Pro X Superlight 2"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Коврик для мыши (Mousepad)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.mousepad}
                    onChange={(e) => updateField('mousepad', e.target.value)}
                    placeholder="Artisan Hayate Otsu FX Soft XL"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Клавиатура (Keyboard)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.keyboard}
                    onChange={(e) => updateField('keyboard', e.target.value)}
                    placeholder="Wooting 60HE (Rapid Trigger)"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Наушники / Гарнитура (Headset)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.headset}
                    onChange={(e) => updateField('headset', e.target.value)}
                    placeholder="HyperX Cloud II Wireless"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Игровой монитор (Monitor)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.monitor}
                    onChange={(e) => updateField('monitor', e.target.value)}
                    placeholder="ZOWIE XL2566K (360Hz DyAc+)"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Любимое оружие в CS2</label>
                  <select
                    className="input-field"
                    value={formData.favoriteWeapon}
                    onChange={(e) => updateField('favoriteWeapon', e.target.value)}
                  >
                    {WEAPONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Сигнатурная карта в маппуле</label>
                  <select
                    className="input-field"
                    value={formData.favoriteMap}
                    onChange={(e) => updateField('favoriteMap', e.target.value)}
                  >
                    {MAPS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>
                  <Save size={15} />
                  <span>Сохранить девайсы</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 5: STEAM И СОЦСЕТИ
            ========================================================================= */}
        {activeTab === 'accounts' && (
          <div className="dashboard-tab-content">
            <form onSubmit={handleSaveProfile} className="panel pp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 className="pp-section-title" style={{ margin: 0 }}>
                    <SteamIcon size={20} />
                    <span>Привязка аккаунтов и социальных сетей</span>
                  </h3>
                  <span className="text-secondary text-xs">
                    Steam ID, ссылка на обмен (Trade URL), FACEIT и ссылки на стримы
                  </span>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  <Save size={15} />
                  <span>Сохранить аккаунты</span>
                </button>
              </div>

              {/* Steam Verification Banner */}
              <div className="steam-account-verified-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SteamIcon size={28} />
                  <div>
                    <h4 style={{ margin: 0, color: '#fff' }}>Steam Аккаунт верифицирован</h4>
                    <span className="text-secondary text-xs">
                      SteamID64: <strong className="font-mono">{formData.steamId}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  onClick={() => showToast('Вы можете изменить Steam URL и Trade URL ниже в полях формы', 'info')}
                >
                  Сменить Steam аккаунт
                </button>
              </div>

              <div className="dashboard-form-grid" style={{ marginTop: 'var(--space-5)' }}>
                <div className="form-field">
                  <label className="form-label">Steam Profile URL</label>
                  <input
                    type="url"
                    className="input-field font-mono"
                    value={formData.steamUrl}
                    onChange={(e) => updateField('steamUrl', e.target.value)}
                    placeholder="https://steamcommunity.com/id/..."
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Steam Trade Offer URL</label>
                  <input
                    type="url"
                    className="input-field font-mono"
                    value={formData.tradeUrl}
                    onChange={(e) => updateField('tradeUrl', e.target.value)}
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                  />
                  <span className="text-tertiary text-xs">Необходим для автоматической передачи скинов из маркета.</span>
                </div>

                <div className="form-field">
                  <label className="form-label">FACEIT Profile URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.faceitUrl}
                    onChange={(e) => updateField('faceitUrl', e.target.value)}
                    placeholder="https://faceit.com/en/players/..."
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">FACEIT ELO</label>
                  <input
                    type="number"
                    className="input-field font-mono"
                    value={formData.faceitElo}
                    onChange={(e) => updateField('faceitElo', parseInt(e.target.value, 10) || 0)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">FACEIT Level (1 - 10)</label>
                  <select
                    className="input-field"
                    value={formData.faceitLevel}
                    onChange={(e) => updateField('faceitLevel', parseInt(e.target.value, 10) || 10)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Уровень {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Twitch Stream URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.twitchUrl}
                    onChange={(e) => updateField('twitchUrl', e.target.value)}
                    placeholder="https://twitch.tv/..."
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Twitter / X</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.twitterUrl}
                    onChange={(e) => updateField('twitterUrl', e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Discord (Имя пользователя / Тег)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.discordTag}
                    onChange={(e) => updateField('discordTag', e.target.value)}
                    placeholder="player#1337"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Telegram (Контакт или канал)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.telegramUrl}
                    onChange={(e) => updateField('telegramUrl', e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>
                  <Save size={15} />
                  <span>Сохранить аккаунты</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 6: МАТЧИ И ЧЕКИН
            ========================================================================= */}
        {activeTab === 'matches' && (
          <div className="dashboard-tab-content">
            <div className="panel pp-section">
              <h3 className="pp-section-title">
                <Swords size={20} />
                <span>Официальные матчи и Чекин команды</span>
              </h3>

              {teamMatches.length > 0 ? (
                <div className="dashboard-matches-list">
                  {teamMatches.map((m) => {
                    const isCheckedIn = !!checkedInMatches[m.id];
                    return (
                      <div key={m.id} className="dashboard-match-row">
                        <div className="match-info-col">
                          <span className="match-status-badge">{m.status}</span>
                          <span className="match-event-name">{m.tournamentName || 'ASCENT League'}</span>
                          <span className="text-secondary text-xs">{m.time || m.date || 'В расписании'}</span>
                        </div>

                        <div className="match-teams-col">
                          <span className="team-text">{m.teamA}</span>
                          <span className="vs-badge">VS</span>
                          <span className="team-text">{m.teamB}</span>
                        </div>

                        <div className="match-actions-col">
                          {isCheckedIn ? (
                            <span className="checkin-confirmed-badge">
                              <CheckCircle2 size={15} />
                              <span>Готов к матчу</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                              onClick={() => handleCheckIn(m.id)}
                            >
                              <CheckSquare size={14} />
                              <span>Подтвердить Чекин</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  <Swords size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
                  <p>На данный момент у вашей команды нет назначенных официальных матчей.</p>
                  <Link to="/tournaments" className="btn-outline" style={{ display: 'inline-flex', marginTop: 'var(--space-4)' }}>
                    Перейти к турнирам
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Save Changes Bar */}
        {hasUnsavedChanges && (
          <div className="dashboard-sticky-save-bar">
            <div className="save-bar-content">
              <span className="save-bar-notice">
                У вас есть несохраненные изменения в параметрах профиля!
              </span>
              <div className="save-bar-actions">
                <button type="button" className="btn-outline" onClick={handleResetForm}>
                  Сбросить
                </button>
                <button type="button" className="btn-primary" onClick={() => handleSaveProfile()}>
                  <Save size={15} />
                  <span>Сохранить все изменения</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Modal */}
        {showAvatarModal && (
          <div className="dashboard-modal-overlay" onClick={() => setShowAvatarModal(false)}>
            <div className="panel dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Смена аватара профиля</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowAvatarModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                {/* Upload File */}
                <div className="modal-upload-box" onClick={() => avatarFileInputRef.current?.click()}>
                  <Upload size={28} className="text-secondary" />
                  <span style={{ fontWeight: 600, marginTop: '6px' }}>Загрузить фото с устройства</span>
                  <span className="text-tertiary text-xs">Поддерживаются JPG, PNG, WEBP (до 5MB)</span>
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                  />
                </div>

                {/* Direct URL Input */}
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <label className="form-label">Или укажите прямую ссылку на фото:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                    />
                    <button type="button" className="btn-primary" onClick={handleApplyAvatarUrl}>
                      Применить
                    </button>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <label className="form-label">Выбрать из галереи аватаров ASCENT:</label>
                  <div className="preset-avatars-grid">
                    {PRESET_AVATARS.map((av) => (
                      <div
                        key={av.name}
                        className="preset-avatar-item"
                        onClick={() => handleSelectPresetAvatar(av.url)}
                      >
                        <img src={av.url} alt={av.name} />
                        <span>{av.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Modal */}
      </div>
    </section>
  );
};

export default PlayerDashboardPage;
