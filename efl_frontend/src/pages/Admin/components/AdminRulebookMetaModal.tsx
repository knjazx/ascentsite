import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';
import '../Admin.css';

interface AdminRulebookMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    rulebookEdition: string;
    rulebookStatus: string;
    rulebookBadge: string;
    rulebookUrl: string;
  }) => void;
  initialData: {
    rulebookEdition: string;
    rulebookStatus: string;
    rulebookBadge: string;
    rulebookUrl: string;
  };
}

const STATUS_PRESETS = [
  'Действующая',
  'В актуализации',
  'Предварительная',
  'Архивная',
];

const AdminRulebookMetaModal: React.FC<AdminRulebookMetaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    rulebookEdition: initialData.rulebookEdition || '2026 Update #2 (v2.4)',
    rulebookStatus: initialData.rulebookStatus || 'Действующая',
    rulebookBadge: initialData.rulebookBadge || '',
    rulebookUrl: initialData.rulebookUrl || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        rulebookEdition: initialData.rulebookEdition || '2026 Update #2 (v2.4)',
        rulebookStatus: initialData.rulebookStatus || 'Действующая',
        rulebookBadge: initialData.rulebookBadge || '',
        rulebookUrl: initialData.rulebookUrl || '',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h2>Параметры редакции и статуса</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Настройка редакции, статуса и официальной ссылки на регламент
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ gap: '1.25rem' }}>
            {/* Live Preview Box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.875rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.725rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Предпросмотр на сайте:
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  <span>Редакция: <strong style={{ color: 'var(--text-primary)' }}>{formData.rulebookEdition || '—'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <Clock size={14} />
                  <span>Статус: <strong style={{ color: 'var(--text-primary)' }}>{formData.rulebookStatus || '—'}</strong></span>
                </div>
              </div>
            </div>

            {/* Field: Edition */}
            <div className="admin-form-group">
              <label htmlFor="meta-edition">
                Редакция регламента <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="meta-edition"
                type="text"
                className="admin-input"
                placeholder="2026 Update #2 (v2.4)"
                value={formData.rulebookEdition}
                onChange={(e) => setFormData((prev) => ({ ...prev, rulebookEdition: e.target.value }))}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Отображается в строке «Редакция: ...» на странице /rules
              </span>
            </div>

            {/* Field: Status */}
            <div className="admin-form-group">
              <label htmlFor="meta-status">
                Статус редакции <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="meta-status"
                type="text"
                className="admin-input"
                placeholder="Действующая"
                value={formData.rulebookStatus}
                onChange={(e) => setFormData((prev) => ({ ...prev, rulebookStatus: e.target.value }))}
                required
              />
              {/* Presets */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '4px' }}>
                {STATUS_PRESETS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rulebookStatus: st }))}
                    style={{
                      background: formData.rulebookStatus === st ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      color: formData.rulebookStatus === st ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.725rem',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Document URL */}
            <div className="admin-form-group">
              <label htmlFor="meta-url">
                Ссылка на документ регламента (Google Docs / PDF)
              </label>
              <input
                id="meta-url"
                type="url"
                className="admin-input"
                placeholder="https://docs.google.com/document/d/..."
                value={formData.rulebookUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, rulebookUrl: e.target.value }))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Кнопка «Открыть официальный регламент» открывает эту ссылку в новой вкладке
              </span>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Save size={16} />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRulebookMetaModal;
