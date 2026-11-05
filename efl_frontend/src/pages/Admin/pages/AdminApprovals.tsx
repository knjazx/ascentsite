import React, { useState } from 'react';
import { Eye, Check, XCircle, Shield, Users } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { TeamApproval, ApprovalStatus } from '../../../context/DataContext';
import AdminApprovalModal from '../components/AdminApprovalModal';
import '../Admin.css';

const AdminApprovals: React.FC = () => {
  const { teamApprovals, approveTeam, rejectTeam } = useData();
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<TeamApproval | null>(null);

  const filteredApprovals = teamApprovals.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleInspect = (approval: TeamApproval) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const handleApprove = (id: string) => {
    approveTeam(id);
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this team application?')) {
      rejectTeam(id);
    }
  };

  const renderStatusBadge = (status: ApprovalStatus) => {
    let bg = 'rgba(234, 179, 8, 0.2)';
    let color = '#eab308';

    if (status === 'approved') {
      bg = 'rgba(74, 222, 128, 0.2)';
      color = '#4ade80';
    } else if (status === 'rejected') {
      bg = 'rgba(239, 68, 68, 0.2)';
      color = '#ef4444';
    }

    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'capitalize',
          backgroundColor: bg,
          color: color,
        }}
      >
        {status}
      </span>
    );
  };

  const pendingCount = teamApprovals.filter((a) => a.status === 'pending').length;

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Team Approvals</h1>
          <p className="admin-page-header__subtitle">Review and manage registration applications submitted by team captains.</p>
        </div>
        {pendingCount > 0 && (
          <div className="admin-page-header__right">
            <span
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: '#eab308',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              {pendingCount} Pending Application{pendingCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="admin-panel-section panel">
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['pending', 'all', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`admin-btn ${filterStatus === st ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Captain</th>
                <th>Contact Email</th>
                <th>Roster</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={18} style={{ color: 'var(--primary-color)' }} />
                      <div>
                        <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)' }}>{a.data.teamName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>[{a.data.teamTag}]</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{a.data.captainNickname}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.data.contactEmail}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Users size={14} />
                      <span>{a.data.mainRoster.length} Main + {a.data.substitutes?.length || 0} Sub</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.submittedAt}</td>
                  <td>{renderStatusBadge(a.status)}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-icon-btn"
                        title="Inspect Application"
                        onClick={() => handleInspect(a)}
                      >
                        <Eye size={18} />
                      </button>
                      {a.status === 'pending' && (
                        <>
                          <button
                            className="admin-icon-btn"
                            title="Approve Team"
                            onClick={() => handleApprove(a.id)}
                            style={{ color: '#22c55e' }}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            title="Reject Team"
                            onClick={() => handleReject(a.id)}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApprovals.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No team applications found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        approval={selectedApproval}
      />
    </>
  );
};

export default AdminApprovals;
