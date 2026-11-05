import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, CalendarRange } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { Season } from '../../../context/DataContext';
import AdminSeasonModal from '../components/AdminSeasonModal';
import '../Admin.css';

const AdminSeasons: React.FC = () => {
  const { seasons, addSeason, updateSeason, deleteSeason, setCurrentSeason } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const handleCreate = () => {
    setEditingSeason(null);
    setIsModalOpen(true);
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this season?')) {
      deleteSeason(id);
    }
  };

  const handleSave = (seasonData: Partial<Season>) => {
    if (editingSeason) {
      updateSeason(editingSeason.id, seasonData);
      if (seasonData.isCurrent) {
        setCurrentSeason(editingSeason.id);
      }
    } else {
      const newId = `season-${Date.now()}`;
      const newSeason: Season = {
        id: newId,
        name: seasonData.name || 'New Season',
        startDate: seasonData.startDate || 'TBD',
        endDate: seasonData.endDate || 'TBD',
        isCurrent: !!seasonData.isCurrent,
      };
      addSeason(newSeason);
      if (newSeason.isCurrent) {
        setCurrentSeason(newId);
      }
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Seasons</h1>
          <p className="admin-page-header__subtitle">Manage competitive seasons, active timeline, and historical records.</p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Create Season
          </button>
        </div>
      </div>

      <div className="admin-panel-section panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Season Name</th>
                <th>Dates</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarRange size={18} style={{ color: s.isCurrent ? '#eab308' : 'var(--text-secondary)' }} />
                      <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td>
                    {s.startDate} &mdash; {s.endDate}
                  </td>
                  <td>
                    {s.isCurrent ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308',
                        }}
                      >
                        <Star size={12} fill="#eab308" /> Active Season
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: 'rgba(107, 114, 128, 0.2)',
                          color: '#9ca3af',
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {!s.isCurrent && (
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                          onClick={() => setCurrentSeason(s.id)}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        className="admin-icon-btn"
                        title="Edit Season"
                        onClick={() => handleEdit(s)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete Season"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {seasons.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No seasons found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminSeasonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        season={editingSeason}
      />
    </>
  );
};

export default AdminSeasons;
