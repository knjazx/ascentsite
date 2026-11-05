import React, { useState, useEffect } from 'react';
import { X, Save, Layers, AlertCircle } from 'lucide-react';
import type {
  ChangelogItem,
  ChangelogCategory,
  ChangelogType,
} from '@/data/mocks/rulesChangelogData';

interface AdminChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ChangelogItem>) => void;
  editingItem: ChangelogItem | null;
}

const CATEGORY_OPTIONS: { value: ChangelogCategory; label: string }[] = [
  { value: 'General', label: '1. Общие положения и регламент' },
  { value: 'Sponsorship & Branding', label: '2. Спонсорские нормы и брендинг' },
  { value: 'Match Operations', label: '3. Регламент проведения матчей' },
  { value: 'Integrity & Anti-Cheat', label: '4. Античит-контроль и честность соревнований' },
  { value: 'Teams & Rosters', label: '5. Составы команд и слоты регистрации' },
  { value: 'Penalties & Winnings', label: '6. Финансовые удержания и штрафные санкции' },
];

const TYPE_OPTIONS: { value: ChangelogType; label: string }[] = [
  { value: 'modified', label: '~ Изменено (Modified)' },
  { value: 'added', label: '+ Добавлено (Added)' },
  { value: 'clarified', label: 'i Уточнено (Clarified)' },
  { value: 'removed', label: '- Удалено (Removed)' },
];

const AdminChangelogModal: React.FC<AdminChangelogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [formData, setFormData] = useState<Partial<ChangelogItem>>({
    sectionNumber: '',
    sectionTitle: '',
    category: 'General',
    type: 'modified',
    title: '',
    description: '',
    previousNote: '',
    details: [],
    version: '2026 Update #2 (v2.4)',
  });

  const [detailsText, setDetailsText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        sectionNumber: editingItem.sectionNumber || '',
        sectionTitle: editingItem.sectionTitle || '',
        category: editingItem.category || 'General',
        type: editingItem.type || 'modified',
        title: editingItem.title || '',
        description: editingItem.description || '',
        previousNote: editingItem.previousNote || '',
        details: editingItem.details || [],
        version: editingItem.version || '2026 Update #2 (v2.4)',
      });
      setDetailsText((editingItem.details || []).join('\n'));
    } else {
      setFormData({
        sectionNumber: '',
        sectionTitle: '',
        category: 'General',
        type: 'modified',
        title: '',
        description: '',
        previousNote: '',
        details: [],
        version: '2026 Update #2 (v2.4)',
      });
      setDetailsText('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sectionNumber?.trim()) {
      setError('Укажите номер статьи (например, 1.1 или 2.8)');
      return;
    }
    if (!formData.title?.trim()) {
      setError('Укажите заголовок изменения');
      return;
    }
    if (!formData.description?.trim()) {
      setError('Укажите описание изменения');
      return;
    }

    const parsedDetails = detailsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      sectionNumber: formData.sectionNumber.trim().replace(/^§\s*/, ''),
      details: parsedDetails,
    });
    onClose();
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container" style={{ maxWidth: '640px' }}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
              {editingItem ? 'Редактировать запись ченджлога' : 'Новое изменение в регламенте'}
            </h2>
          </div>
          <button className="admin-modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form" style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: '0 0 140px' }}>
              <label>Номер статьи (§) *</label>
              <input
                type="text"
                value={formData.sectionNumber || ''}
                onChange={(e) => setFormData((p) => ({ ...p, sectionNumber: e.target.value }))}
                placeholder="например: 1.1"
                required
              />
            </div>

            <div className="admin-form-group" style={{ flex: 1 }}>
              <label>Название статьи / Подзаголовок</label>
              <input
                type="text"
                value={formData.sectionTitle || ''}
                onChange={(e) => setFormData((p) => ({ ...p, sectionTitle: e.target.value }))}
                placeholder="например: Range of Validity & Consolidation"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 1 }}>
              <label>Глава регламента *</label>
              <select
                value={formData.category || 'General'}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, category: e.target.value as ChangelogCategory }))
                }
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group" style={{ flex: 1 }}>
              <label>Тип изменения *</label>
              <select
                value={formData.type || 'modified'}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, type: e.target.value as ChangelogType }))
                }
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Заголовок изменения *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="например: Ужесточение сроков дисквалификации за нарушения честности"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Описание изменения *</label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Подробно объясните суть поправки и как она применяется..."
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Было ранее (необязательно, для контекста сравнения)</label>
            <input
              type="text"
              value={formData.previousNote || ''}
              onChange={(e) => setFormData((p) => ({ ...p, previousNote: e.target.value }))}
              placeholder="например: Ранее применялся 2-летний бан..."
            />
          </div>

          <div className="admin-form-group">
            <label>Детали поправки (каждый пункт с новой строки, необязательно)</label>
            <textarea
              rows={3}
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              placeholder="Пункт 1&#10;Пункт 2"
            />
          </div>

          <div className="admin-form-group">
            <label>Версия регламента</label>
            <input
              type="text"
              value={formData.version || '2026 Update #2 (v2.4)'}
              onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))}
              placeholder="2026 Update #2 (v2.4)"
            />
          </div>

          <div className="admin-modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Save size={16} />
              Сохранить изменение
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChangelogModal;
