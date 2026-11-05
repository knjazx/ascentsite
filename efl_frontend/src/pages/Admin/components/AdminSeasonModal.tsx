import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Season } from '../../../context/DataContext';

interface AdminSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seasonData: Partial<Season>) => void;
  season: Season | null;
}

const AdminSeasonModal: React.FC<AdminSeasonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  season,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        isCurrent: season.isCurrent,
      });
    } else {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
    }
  }, [season, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{season ? 'Edit Season' : 'Create New Season'}</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label>Season Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Season Two"
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Start Date</label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  placeholder="e.g. May 12, 2026"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>End Date</label>
                <input
                  type="text"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  placeholder="e.g. Aug 24, 2026"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group" style={{ marginTop: '0.5rem' }}>
              <label className="admin-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isCurrent"
                  checked={formData.isCurrent}
                  onChange={handleChange}
                />
                Mark as Active/Current Season
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {season ? 'Save Changes' : 'Create Season'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSeasonModal;
