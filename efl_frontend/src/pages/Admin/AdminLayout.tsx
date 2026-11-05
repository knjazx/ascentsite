import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Trophy,
  Swords,
  Shield,
  Users2,
  CalendarRange,
  BookOpen,
  UserCheck,
  Settings,
  ShoppingBag,
  ArrowLeft,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './AdminLayout.css';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  end?: boolean;
  badgeType?: 'approvals' | 'marketOrders';
}

const navItems: AdminNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/market', label: 'Market (Рынок)', icon: ShoppingBag, badgeType: 'marketOrders' },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/admin/matches', label: 'Matches', icon: Swords },
  { to: '/admin/teams', label: 'Teams', icon: Shield },
  { to: '/admin/players', label: 'Players', icon: Users2 },
  { to: '/admin/seasons', label: 'Seasons', icon: CalendarRange },
  { to: '/admin/rules', label: 'Rulebook', icon: BookOpen },
  { to: '/admin/approvals', label: 'Team Approvals', icon: UserCheck, badgeType: 'approvals' },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { teamApprovals, marketOrders } = useData();
  const pendingApprovalsCount = teamApprovals.filter((a) => a.status === 'pending').length;
  const pendingOrdersCount = marketOrders.filter((o) => o.status === 'pending').length;

  const getBadgeCount = (type?: 'approvals' | 'marketOrders') => {
    if (type === 'approvals') return pendingApprovalsCount;
    if (type === 'marketOrders') return pendingOrdersCount;
    return 0;
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo-mark">ASCENT</span>
          <span className="admin-sidebar__logo-text">
            ASCENT
            <br />
            CS2 League
            <br />
            Admin
          </span>
        </div>

        <nav className="admin-sidebar__nav">
          <span className="admin-sidebar__section-label">Content</span>
          {navItems.map(({ to, label, icon: Icon, end, badgeType }) => {
            const count = getBadgeCount(badgeType);
            const targetUrl = badgeType === 'marketOrders' && pendingOrdersCount > 0 ? '/admin/market?tab=orders' : to;

            return (
              <NavLink
                key={to}
                to={targetUrl}
                end={end}
                className={({ isActive }) => `admin-sidebar__link${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                {label}
                {count > 0 && (
                  <span
                    className="admin-sidebar__badge"
                    style={badgeType === 'marketOrders' ? { backgroundColor: '#eab308', color: '#000000', fontWeight: 'bold' } : undefined}
                    title={badgeType === 'marketOrders' ? `Заказов на выдачу: ${count}` : `Заявок на рассмотрение: ${count}`}
                  >
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}

          <Link to="/" className="admin-back-link">
            <ArrowLeft size={18} />
            Back to site
          </Link>
        </nav>

        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__avatar">A</span>
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user-name">Admin</span>
            <span className="admin-sidebar__user-role">Administrator</span>
          </div>
        </div>
      </aside>

      <div className="admin-content">
        <div className="admin-content__inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
