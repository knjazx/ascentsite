import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MatchItem, MatchStatus } from '@/types';
import { useData } from '../../../context/DataContext';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';

interface AdminMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (matchData: Partial<MatchItem>) => void;
  match: MatchItem | null;
}

const statusOptions: { value: MatchStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
];

const AdminMatchModal: React.FC<AdminMatchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  match,
}) => {
  const { tournaments, teams } = useData();

  const [formData, setFormData] = useState<Partial<MatchItem>>({
    tournamentName: tournaments[0]?.name || '',
    tournamentSlug: tournaments[0]?.slug || '',
    stage: 'Group Stage — Group A',
    teamA: teams[0]?.name || '',
    teamB: teams[1]?.name || '',
    status: 'upcoming',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: '18:00 UTC',
    scoreA: 0,
    scoreB: 0,
  });

  useEffect(() => {
    if (match) {
      setFormData(match);
    } else {
      setFormData({
        tournamentName: tournaments[0]?.name || '',
        tournamentSlug: tournaments[0]?.slug || '',
        stage: 'Group Stage — Group A',
        teamA: teams[0]?.name || '',
        teamB: teams[1]?.name || '',
        status: 'upcoming',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '18:00 UTC',
        scoreA: 0,
        scoreB: 0,
      });
    }
  }, [match, isOpen, tournaments, teams]);

  if (!isOpen) return null;

  const handleTournamentChange = (slugValue: string) => {
    const selectedTourney = tournaments.find((t) => t.slug === slugValue);
    setFormData((prev) => ({
      ...prev,
      tournamentSlug: slugValue,
      tournamentName: selectedTourney ? selectedTourney.name : prev.tournamentName,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const tournamentOptions = tournaments.map((t) => ({ value: t.slug, label: t.name }));
  const teamOptions = teams.map((t) => ({ value: t.name, label: t.name }));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{match ? 'Edit Match' : 'Create New Match'}</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ gap: '1rem' }}>
            <div className="admin-form-group">
              <label>Tournament</label>
              <CustomSelect
                options={tournamentOptions}
                value={formData.tournamentSlug || ''}
                onChange={handleTournamentChange}
              />
            </div>

            <div className="admin-form-group">
              <label>Stage / Phase</label>
              <input
                type="text"
                name="stage"
                value={formData.stage || ''}
                onChange={handleChange}
                placeholder="e.g. Group Stage — Group A or Round 1"
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Team A</label>
                {teamOptions.length > 0 ? (
                  <CustomSelect
                    options={teamOptions}
                    value={formData.teamA || ''}
                    onChange={(val) => setFormData((prev) => ({ ...prev, teamA: val }))}
                  />
                ) : (
                  <input
                    type="text"
                    name="teamA"
                    value={formData.teamA || ''}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              <div className="admin-form-group">
                <label>Team B</label>
                {teamOptions.length > 0 ? (
                  <CustomSelect
                    options={teamOptions}
                    value={formData.teamB || ''}
                    onChange={(val) => setFormData((prev) => ({ ...prev, teamB: val }))}
                  />
                ) : (
                  <input
                    type="text"
                    name="teamB"
                    value={formData.teamB || ''}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Status</label>
                <CustomSelect
                  options={statusOptions}
                  value={formData.status || 'upcoming'}
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val as MatchStatus }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Date</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  placeholder="e.g. Aug 14, 2025 or Today"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Time (Optional)</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time || ''}
                  onChange={handleChange}
                  placeholder="e.g. 18:00 UTC"
                />
              </div>
            </div>

            {(formData.status === 'completed' || formData.status === 'live') && (
              <div className="admin-form-row" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="admin-form-group">
                  <label>{formData.teamA || 'Team A'} Score</label>
                  <input
                    type="number"
                    name="scoreA"
                    value={formData.scoreA ?? 0}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
                <div className="admin-form-group">
                  <label>{formData.teamB || 'Team B'} Score</label>
                  <input
                    type="number"
                    name="scoreB"
                    value={formData.scoreB ?? 0}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {match ? 'Save Changes' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMatchModal;
