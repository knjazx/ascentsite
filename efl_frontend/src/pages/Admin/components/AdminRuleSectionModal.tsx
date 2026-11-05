import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { RuleSection, RuleItem, RuleIconName, RuleSeverity } from '@/types';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';

interface AdminRuleSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Partial<RuleSection>) => void;
  section: RuleSection | null;
}

const iconOptions: { value: RuleIconName; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'users', label: 'Users' },
  { value: 'gamepad', label: 'Gamepad' },
  { value: 'user-check', label: 'User Check' },
  { value: 'ban', label: 'Ban / Penalty' },
  { value: 'gavel', label: 'Gavel / Disciplinary' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'clock', label: 'Clock / Schedule' },
];

const severityOptions: { value: RuleSeverity; label: string }[] = [
  { value: 'info', label: 'Info (Normal)' },
  { value: 'warning', label: 'Warning (Medium)' },
  { value: 'danger', label: 'Danger (Critical)' },
];

const AdminRuleSectionModal: React.FC<AdminRuleSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  section,
}) => {
  const [formData, setFormData] = useState<Partial<RuleSection>>({
    id: '',
    title: '',
    icon: 'book',
    badge: '',
    rules: [],
  });

  useEffect(() => {
    if (section) {
      setFormData(section);
    } else {
      setFormData({
        id: '',
        title: '',
        icon: 'book',
        badge: '',
        rules: [
          { number: '1.1', title: 'Sample Rule', description: 'Rule description here.' }
        ],
      });
    }
  }, [section, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'title' && !section) {
      const autoId = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, title: value, id: autoId }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRuleChange = (index: number, field: keyof RuleItem, value: any) => {
    setFormData((prev) => {
      const updatedRules = [...(prev.rules || [])];
      updatedRules[index] = { ...updatedRules[index], [field]: value };
      return { ...prev, rules: updatedRules };
    });
  };

  const handleAddRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [
        ...(prev.rules || []),
        {
          number: `${(prev.rules || []).length + 1}.1`,
          title: 'New Rule Title',
          description: 'Enter rule details...',
          severity: 'info',
        },
      ],
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: (prev.rules || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '750px', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{section ? 'Edit Rule Section & Rules' : 'Create Rule Section'}</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="admin-modal-body" style={{ overflowY: 'auto', gap: '1.25rem' }}>
            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 2 }}>
                <label>Section Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="e.g. 1. General Provisions"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Icon</label>
                <CustomSelect
                  options={iconOptions}
                  value={formData.icon || 'book'}
                  onChange={(val) => setFormData((prev) => ({ ...prev, icon: val as RuleIconName }))}
                />
              </div>

              <div className="admin-form-group">
                <label>Badge (Optional)</label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge || ''}
                  onChange={handleChange}
                  placeholder="e.g. Core Rules"
                />
              </div>
            </div>

            {/* Rules List Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Rule Items ({formData.rules?.length || 0})
                </h3>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleAddRule}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Plus size={14} /> Add Rule Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.rules?.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={rule.number}
                        onChange={(e) => handleRuleChange(idx, 'number', e.target.value)}
                        placeholder="1.1"
                        style={{ width: '80px', fontWeight: 'bold' }}
                        required
                      />
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => handleRuleChange(idx, 'title', e.target.value)}
                        placeholder="Rule Title"
                        style={{ flex: 1, fontWeight: 'bold' }}
                        required
                      />
                      <div style={{ width: '160px' }}>
                        <CustomSelect
                          options={severityOptions}
                          value={rule.severity || 'info'}
                          onChange={(val) => handleRuleChange(idx, 'severity', val)}
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Remove Rule"
                        onClick={() => handleRemoveRule(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <textarea
                        value={rule.description}
                        onChange={(e) => handleRuleChange(idx, 'description', e.target.value)}
                        placeholder="Rule details and descriptions..."
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {section ? 'Save Changes' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRuleSectionModal;
