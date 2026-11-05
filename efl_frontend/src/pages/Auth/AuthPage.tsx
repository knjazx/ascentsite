import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import SteamAuthModal from './components/SteamAuthModal';
import './AuthPage.css';

type AuthTab = 'login' | 'signup';

interface AuthPageProps {
  defaultTab?: AuthTab;
}

const AuthPage: React.FC<AuthPageProps> = ({ defaultTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as AuthTab | null;
  const initialTab: AuthTab =
    queryTab === 'signup' || defaultTab === 'signup' || window.location.pathname === '/signup'
      ? 'signup'
      : 'login';

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('modal') === '1');

  useEffect(() => {
    if (queryTab === 'signup' || queryTab === 'login') {
      setTab(queryTab);
    } else if (window.location.pathname === '/signup') {
      setTab('signup');
    } else if (window.location.pathname === '/login') {
      setTab('login');
    }
  }, [queryTab]);

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
    <section className="inride-auth-page">
      <div className="inride-auth-container">
        <div className="inride-auth-card">
          {/* Header */}
          <div className="inride-auth-header">
            <h1 className="inride-auth-title">
              {tab === 'signup' ? 'Присоединиться к ASCENT' : 'Вход в ASCENT'}
            </h1>
            <p className="inride-auth-sub">
              {tab === 'signup'
                ? 'Выберите игровой аккаунт, с которым хотите создать профиль ASCENT.'
                : 'Войдите в свой соревновательный профиль с помощью аккаунта Steam.'}
            </p>
          </div>

          {/* Segmented Control (Tabs) */}
          <div className="inride-segmented-control">
            <button
              type="button"
              className={`inride-segment-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Уже есть профиль
            </button>
            <button
              type="button"
              className={`inride-segment-btn ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Создать профиль
            </button>
          </div>

          {/* Steam Action Button (Only Steam, without checkboxes) */}
          <div className="inride-auth-actions">
            <button
              type="button"
              className="inride-steam-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <SteamIcon size={20} className="inride-steam-icon" />
              <span>
                {tab === 'signup'
                  ? 'Создать профиль через Steam'
                  : 'Войти через Steam'}
              </span>
            </button>
          </div>

          {/* Security & Agreement Note */}
          <p className="inride-auth-agreement">
            Авторизуясь через Steam, вы подтверждаете согласие с{' '}
            <Link to="/rules" className="inride-rules-link">
              Правилами лиги
            </Link>{' '}
            и привязку игрового CS2 профиля.
          </p>

          {/* Guest Link at Bottom */}
          <div className="inride-auth-footer">
            <Link to="/?guest=1" className="inride-guest-link">
              <span>Посмотреть платформу без входа</span>
              <span className="inride-guest-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Official Steam OpenID Modal Window */}
      <SteamAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isRegister={tab === 'signup'}
      />
    </section>
  );
};

export default AuthPage;
