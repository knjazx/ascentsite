import React from 'react';
import { X, Check, XCircle, ExternalLink, Mail, Disc as DiscordIcon, Shield, User } from 'lucide-react';
import type { TeamApproval } from '../../../context/DataContext';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approval: TeamApproval | null;
}

const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  approval,
}) => {
  if (!isOpen || !approval) return null;

  const { data, submittedAt, status } = approval;

  const handleApprove = () => {
    onApprove(approval.id);
    onClose();
  };

  const handleReject = () => {
    onReject(approval.id);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '700px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={22} style={{ color: 'var(--primary-color)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>{data.teamName} <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>[{data.teamTag}]</span></h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Submitted on {submittedAt}</span>
            </div>
          </div>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body" style={{ overflowY: 'auto', gap: '1.25rem' }}>
          {/* Status Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Status:</span>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor:
                  status === 'approved' ? 'rgba(74, 222, 128, 0.2)' :
                  status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                  'rgba(234, 179, 8, 0.2)',
                color:
                  status === 'approved' ? '#4ade80' :
                  status === 'rejected' ? '#ef4444' :
                  '#eab308',
              }}
            >
              {status}
            </span>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact Information</h3>
            <div className="admin-form-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{data.contactEmail}</span>
              </div>
              {data.discordLink && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <DiscordIcon size={16} style={{ color: '#5865F2' }} />
                  <a href={data.discordLink} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Discord <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Captain Info */}
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Team Captain</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
              <User size={18} style={{ color: 'var(--primary-color)' }} />
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{data.captainNickname}</div>
                {data.captainSteamUrl && (
                  <a href={data.captainSteamUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Steam Profile <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Roster */}
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Main Roster ({data.mainRoster.length} Players)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.mainRoster.map((player, idx) => (
                <div
                  key={player.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>#{idx + 1}</span>
                    {player.nickname}
                  </div>
                  {player.steamUrl ? (
                    <a href={player.steamUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Steam <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Steam link</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes */}
          {data.substitutes && data.substitutes.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Substitutes ({data.substitutes.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.substitutes.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ color: 'var(--text-primary)' }}>{sub.nickname}</div>
                    {sub.steamUrl && (
                      <a href={sub.steamUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        Steam <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-modal-footer" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close
          </button>
          {status === 'pending' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={handleReject} style={{ color: '#ef4444' }}>
                <XCircle size={16} /> Reject Application
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleApprove} style={{ backgroundColor: '#22c55e' }}>
                <Check size={16} /> Approve & Register Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalModal;
