import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Settings2 } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { TournamentSummary } from '@/types';
import AdminTournamentModal from '../components/AdminTournamentModal';
import '../Admin.css';

const AdminTournaments: React.FC = () => {
  const { tournaments, addTournament, updateTournament, deleteTournament } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentSummary | null>(null);

  const handleCreate = () => {
    setEditingTournament(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tournament: TournamentSummary) => {
    setEditingTournament(tournament);
    setIsModalOpen(true);
  };

  const handleDelete = (slug: string) => {
    if (window.confirm('Are you sure you want to delete this tournament? This will also delete all its detailed data.')) {
      deleteTournament(slug);
    }
  };

  const handleSave = (data: Partial<TournamentSummary>) => {
    if (editingTournament) {
      updateTournament(editingTournament.slug, data);
    } else {
      addTournament(data as TournamentSummary);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Tournaments</h1>
          <p className="admin-page-header__subtitle">Manage all active, upcoming, and past tournaments.</p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Create Tournament
          </button>
        </div>
      </div>

      <div className="admin-panel-section panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Season</th>
                <th>Type</th>
                <th>Format</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t.slug}>
                  <td style={{ fontWeight: 'var(--fw-medium)' }}>{t.name}</td>
                  <td>{t.season}</td>
                  <td>{t.type}</td>
                  <td>{t.format}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor:
                          t.status === 'ongoing' ? 'rgba(34, 197, 94, 0.2)' :
                            t.status === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' :
                              'rgba(107, 114, 128, 0.2)',
                        color:
                          t.status === 'ongoing' ? '#4ade80' :
                            t.status === 'upcoming' ? '#60a5fa' :
                              '#9ca3af',
                      }}
                    >
                      {t.statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        to={`/admin/tournaments/${t.slug}`}
                        className="admin-icon-btn"
                        title="Manage Details"
                      >
                        <Settings2 size={18} />
                      </Link>
                      <button
                        className="admin-icon-btn"
                        title="Edit Summary"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete Tournament"
                        onClick={() => handleDelete(t.slug)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No tournaments found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminTournamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        tournament={editingTournament}
      />
    </>
  );
};

export default AdminTournaments;
