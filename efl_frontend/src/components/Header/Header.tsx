import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, Globe, Menu, X, Shield } from 'lucide-react';
import { useData } from '@/context/DataContext';
import CoinIcon from '@/components/ui/CoinIcon/CoinIcon';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import ascentLogo from '@/assets/ascent_logo.png';

const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Главная', end: true },
  { to: '/stats', label: 'Stats' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/market', label: 'Market' },
  { to: '/news', label: 'News' },
  { to: '/rules', label: 'Rules' },
];

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, marketBalance, openWallet } = useData();

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" onClick={closeMobile}>
          <img src={ascentLogo} alt="ASCENT" className="site-header__logo-img" />
          <span className="site-header__logo-name">ASCENT CS2 LEAGUE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="site-nav desktop-only">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end ?? to === '/'}
              className={({ isActive }) => `site-nav__link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Header Actions */}
        <div className="site-header__actions desktop-only">
          {currentUser && (
            <button
              type="button"
              className="header-balance-btn"
              onClick={openWallet}
              title="Открыть кошелёк игрока ASCENT"
            >
              <CoinIcon size={15} />
              <span>{marketBalance.toLocaleString()} AC</span>
            </button>
          )}

          <div className="lang-toggle" title="Language: English" style={{ cursor: 'default' }}>
            <Globe size={18} />
            <span>EN</span>
          </div>

          {currentUser ? (
            <Link to="/profile" className="header-user-btn" title="Player Cabinet">
              <span className="header-user-avatar">
                <img src={currentUser.avatar} alt={currentUser.nickname} />
              </span>
              <span className="header-user-name">{currentUser.nickname}</span>
              {currentUser.role === 'captain' && <Shield size={12} style={{ color: '#fbbf24' }} />}
            </Link>
          ) : (
            <Link to="/login" className="header-steam-login-btn" title="Войти через Steam OpenID">
              <SteamIcon size={16} />
              <span>Войти через Steam</span>
            </Link>
          )}
        </div>

        {/* Mobile Burger Toggle Button */}
        <button
          type="button"
          className="mobile-burger-btn"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobile}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-drawer__nav">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end ?? to === '/'}
                  onClick={closeMobile}
                  className={({ isActive }) => `mobile-drawer__link${isActive ? ' active' : ''}`}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mobile-drawer__actions">
              {currentUser && (
                <button
                  type="button"
                  className="header-balance-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  onClick={() => {
                    closeMobile();
                    openWallet();
                  }}
                >
                  <CoinIcon size={16} />
                  <span>Баланс: {marketBalance.toLocaleString()} AC</span>
                </button>
              )}

              {currentUser ? (
                <Link to="/profile" className="btn-primary mobile-drawer__btn" onClick={closeMobile}>
                  <User size={18} />
                  Cabinet ({currentUser.nickname})
                </Link>
              ) : (
                <Link to="/login" className="header-steam-login-btn mobile-drawer__btn" style={{ justifyContent: 'center', padding: '10px' }} onClick={closeMobile}>
                  <SteamIcon size={18} />
                  <span>Войти через Steam</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
