import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TournamentSummary, TournamentIcon, TournamentStatus } from '@/types';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';

interface AdminTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TournamentSummary>) => void;
  tournament?: TournamentSummary | null;
}

const ICONS: TournamentIcon[] = ['trophy', 'target', 'shield', 'chevrons', 'star'];
const STATUSES: { value: TournamentStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const AdminTournamentModal: React.FC<AdminTournamentModalProps> = ({ isOpen, onClose, onSave, tournament }) => {
  const [formData, setFormData] = useState<Partial<TournamentSummary>>({
    name: '',
    slug: '',
    type: 'Major',
    icon: 'trophy',
    season: 'Season One',
    teams: 16,
    dateRange: '',
    format: '5v5',
    status: 'upcoming',
    statusLabel: 'Registration Open',
  });

  useEffect(() => {
    if (tournament) {
      setFormData(tournament);
    } else {
      setFormData({
        name: '',
        slug: '',
        type: 'Major',
        icon: 'trophy',
        season: 'Season One',
        teams: 16,
        dateRange: '',
        format: '5v5',
        status: 'upcoming',
        statusLabel: 'Registration Open',
      });
    }
  }, [tournament, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'teams' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2>{tournament ? 'Edit Tournament' : 'Create Tournament'}</h2>
          <button className="admin-icon-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label>Tournament Name</label>
              <input
                className="admin-input"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. ASCENT Summer Championship"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Slug (URL-friendly)</label>
              <input
                className="admin-input"
                name="slug"
                value={formData.slug || ''}
                onChange={handleChange}
                placeholder="e.g. summer-champ-2026"
                required
                disabled={!!tournament}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="admin-form-group">
                <label>Type</label>
                <input
                  className="admin-input"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                  placeholder="e.g. Major, Minor"
                />
              </div>

              <div className="admin-form-group">
                <label>Icon</label>
                <CustomSelect
                  value={formData.icon || 'trophy'}
                  onChange={(val) => setFormData((prev) => ({ ...prev, icon: val as TournamentIcon }))}
                  options={ICONS}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="admin-form-group">
                <label>Season</label>
                <input
                  className="admin-input"
                  name="season"
                  value={formData.season || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label>Format</label>
                <input
                  className="admin-input"
                  name="format"
                  value={formData.format || ''}
                  onChange={handleChange}
                  placeholder="e.g. 5v5"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="admin-form-group">
                <label>Total Teams</label>
                <input
                  className="admin-input"
                  type="number"
                  name="teams"
                  value={formData.teams || 0}
                  onChange={handleChange}
                  min={2}
                />
              </div>

              <div className="admin-form-group">
                <label>Date Range</label>
                <input
                  className="admin-input"
                  name="dateRange"
                  value={formData.dateRange || ''}
                  onChange={handleChange}
                  placeholder="e.g. Aug 1 - Aug 20"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="admin-form-group">
                <label>Status</label>
                <CustomSelect
                  value={formData.status || 'upcoming'}
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val as TournamentStatus }))}
                  options={STATUSES}
                />
              </div>

              <div className="admin-form-group">
                <label>Status Label</label>
                <input
                  className="admin-input"
                  name="statusLabel"
                  value={formData.statusLabel || ''}
                  onChange={handleChange}
                  placeholder="e.g. Group Stage"
                />
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {tournament ? 'Save Changes' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTournamentModal;
