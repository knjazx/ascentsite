import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Radio } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { MatchItem, MatchStatus } from '@/types';
import AdminMatchModal from '../components/AdminMatchModal';
import '../Admin.css';

const AdminMatches: React.FC = () => {
  const { matches, addMatch, updateMatch, deleteMatch } = useData();
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchItem | null>(null);

  const filteredMatches = matches.filter((m) => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  const handleCreate = () => {
    setEditingMatch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (match: MatchItem) => {
    setEditingMatch(match);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      deleteMatch(id);
    }
  };

  const handleSave = (matchData: Partial<MatchItem>) => {
    if (editingMatch) {
      updateMatch(editingMatch.id, matchData);
    } else {
      const newMatch: MatchItem = {
        id: `m-${Date.now()}`,
        tournamentName: matchData.tournamentName || 'ASCENT League',
        tournamentSlug: matchData.tournamentSlug || 'ascent-league',
        stage: matchData.stage || 'Group Stage',
        teamA: matchData.teamA || 'Team 1',
        teamB: matchData.teamB || 'Team 2',
        status: matchData.status || 'upcoming',
        date: matchData.date || 'Today',
        time: matchData.time,
        scoreA: matchData.scoreA,
        scoreB: matchData.scoreB,
      };
      addMatch(newMatch);
    }
  };

  const renderStatusBadge = (status: MatchStatus) => {
    if (status === 'live') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
          }}
        >
          <Radio size={12} className="animate-pulse" />
          LIVE
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
          }}
        >
          Upcoming
        </span>
      );
    }
    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          color: '#9ca3af',
        }}
      >
        Completed
      </span>
    );
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Matches</h1>
          <p className="admin-page-header__subtitle">Manage schedules, live scores, and completed match results.</p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Create Match
          </button>
        </div>
      </div>

      <div className="admin-panel-section panel">
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['all', 'live', 'upcoming', 'completed'] as const).map((st) => (
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
                <th>Matchup</th>
                <th>Tournament & Stage</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 'var(--fw-medium)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{m.teamA}</span>
                    <span style={{ color: 'var(--text-secondary)', margin: '0 0.5rem' }}>vs</span>
                    <span style={{ color: 'var(--text-primary)' }}>{m.teamB}</span>
                  </td>
                  <td>
                    <div>{m.tournamentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.stage}</div>
                  </td>
                  <td>{renderStatusBadge(m.status)}</td>
                  <td>
                    {m.scoreA !== undefined && m.scoreB !== undefined ? (
                      <span style={{ fontWeight: 'var(--fw-bold)', fontFamily: 'monospace' }}>
                        {m.scoreA} : {m.scoreB}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div>{m.date}</div>
                    {m.time && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.time}</div>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-icon-btn"
                        title="Edit Match"
                        onClick={() => handleEdit(m)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete Match"
                        onClick={() => handleDelete(m.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMatches.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No matches found for this filter. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminMatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        match={editingMatch}
      />
    </>
  );
};

export default AdminMatches;
