import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Users2, Swords, Newspaper, ShoppingBag } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import '../Admin.css';

const AdminDashboard: React.FC = () => {
  const { tournaments, teams, players, matches, news, teamApprovals, marketOrders } = useData();
  const pendingApprovals = teamApprovals.filter((a) => a.status === 'pending');
  const pendingOrders = marketOrders.filter((o) => o.status === 'pending');

  const stats = [
    { label: 'Tournaments', value: tournaments.length, icon: Trophy },
    { label: 'Teams', value: teams.length, icon: Shield },
    { label: 'Players', value: players.length, icon: Users2 },
    { label: 'Matches', value: matches.length, icon: Swords },
    { label: 'News Articles', value: news.length, icon: Newspaper },
    { label: 'Market Orders', value: marketOrders.length, icon: ShoppingBag, pendingCount: pendingOrders.length },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Dashboard</h1>
          <p className="admin-page-header__subtitle">Overview of everything happening on the site.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {stats.map(({ label, value, icon: Icon, pendingCount }) => (
          <div key={label} className="panel admin-stat-card">
            <span className="admin-stat-card__icon">
              <Icon size={20} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p className="admin-stat-card__value">{value}</p>
                {typeof pendingCount === 'number' && pendingCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: '#eab308',
                      color: '#000000',
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                    title={`${pendingCount} в очереди на выдачу`}
                  >
                    +{pendingCount}
                  </span>
                )}
              </div>
              <span className="text-tertiary admin-stat-card__label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Market Orders Queue */}
        <div className="panel admin-panel-section">
          <div className="admin-panel-section__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Заказы игроков (Market)</h2>
              {pendingOrders.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: '#eab308',
                    color: '#000000',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {pendingOrders.length} в очереди
                </span>
              )}
            </div>
            <Link to="/admin/market?tab=orders" className="admin-panel-section__link">
              Все заказы →
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-secondary">Нет активных заказов, ожидающих выдачи.</p>
          ) : (
            <ul className="admin-approval-preview">
              {pendingOrders.slice(0, 5).map((ord) => (
                <li
                  key={ord.id}
                  className="admin-approval-preview__row"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{ord.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {ord.buyerNickname ? `${ord.buyerNickname} • ` : ''}
                      {ord.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{ord.price.toLocaleString()} AC</span>
                    <Link
                      to="/admin/market?tab=orders"
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '3px 8px', fontSize: '11px', textDecoration: 'none' }}
                    >
                      Выдать
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Team Approvals */}
        <div className="panel admin-panel-section">
          <div className="admin-panel-section__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Pending Team Approvals</h2>
              {pendingApprovals.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--accent-negative)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {pendingApprovals.length}
                </span>
              )}
            </div>
            <Link to="/admin/approvals" className="admin-panel-section__link">
              View all
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <p className="text-secondary">No pending approvals.</p>
          ) : (
            <ul className="admin-approval-preview">
              {pendingApprovals.slice(0, 5).map((a) => (
                <li key={a.id} className="admin-approval-preview__row">
                  <span>{a.data.teamName}</span>
                  <span className="text-tertiary">{a.submittedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
