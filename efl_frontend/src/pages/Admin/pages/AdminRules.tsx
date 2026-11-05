import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Layers, Calendar, Clock, Settings } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { RuleSection } from '@/types';
import type { ChangelogItem } from '@/data/mocks/rulesChangelogData';
import AdminRuleSectionModal from '../components/AdminRuleSectionModal';
import AdminChangelogModal from '../components/AdminChangelogModal';
import AdminRulebookMetaModal from '../components/AdminRulebookMetaModal';
import '../Admin.css';

const AdminRules: React.FC = () => {
  const {
    rules,
    addRuleSection,
    updateRuleSection,
    deleteRuleSection,
    changelog,
    addChangelogItem,
    updateChangelogItem,
    deleteChangelogItem,
    settings,
    updateSettings,
  } = useData();

  const [activeTab, setActiveTab] = useState<'changelog' | 'sections'>('changelog');

  // Rule Sections modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<RuleSection | null>(null);

  // Changelog modal
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState<ChangelogItem | null>(null);

  // Rulebook Meta modal (Edition, Status, Badge, URL)
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Section actions
  const handleCreateSection = () => {
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const handleEditSection = (section: RuleSection) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleDeleteSection = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот раздел регламента?')) {
      deleteRuleSection(id);
    }
  };

  const handleSaveSection = (sectionData: Partial<RuleSection>) => {
    if (editingSection) {
      updateRuleSection(editingSection.id, sectionData);
    } else {
      const newId = sectionData.id || `section-${Date.now()}`;
      const newSection: RuleSection = {
        id: newId,
        icon: sectionData.icon || 'book',
        title: sectionData.title || 'Новый раздел регламента',
        badge: sectionData.badge,
        rules: sectionData.rules || [],
      };
      addRuleSection(newSection);
    }
  };

  // Changelog actions
  const handleCreateChangelog = () => {
    setEditingChangelog(null);
    setIsChangelogModalOpen(true);
  };

  const handleEditChangelog = (item: ChangelogItem) => {
    setEditingChangelog(item);
    setIsChangelogModalOpen(true);
  };

  const handleDeleteChangelog = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись из списка изменений?')) {
      deleteChangelogItem(id);
    }
  };

  const handleSaveChangelog = (data: Partial<ChangelogItem>) => {
    if (editingChangelog) {
      updateChangelogItem(editingChangelog.id, data);
    } else {
      const newItem: ChangelogItem = {
        id: `cl-${Date.now()}`,
        sectionNumber: data.sectionNumber || '1.0',
        sectionTitle: data.sectionTitle || 'General',
        category: data.category || 'General',
        type: data.type || 'modified',
        title: data.title || 'Изменение регламента',
        description: data.description || '',
        previousNote: data.previousNote,
        details: data.details || [],
        version: data.version || '2026 Update #2 (v2.4)',
        createdAt: new Date().toLocaleDateString('ru-RU'),
      };
      addChangelogItem(newItem);
    }
  };

  const handleSaveMeta = (data: {
    rulebookEdition: string;
    rulebookStatus: string;
    rulebookBadge: string;
    rulebookUrl: string;
  }) => {
    updateSettings({
      ...settings,
      ...data,
    });
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>Регламент и Ченджлог</h1>
          <p className="admin-page-header__subtitle">
            Управление официальным регламентом и публикация поправок в ченджлог лиги ASCENT.
          </p>
        </div>
        <div className="admin-page-header__right">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setIsMetaModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Settings size={16} />
            <span>Настроить редакцию и статус</span>
          </button>
          {activeTab === 'changelog' ? (
            <button className="admin-btn admin-btn-primary" onClick={handleCreateChangelog}>
              <Plus size={18} />
              Добавить изменение в ченджлог
            </button>
          ) : (
            <button className="admin-btn admin-btn-primary" onClick={handleCreateSection}>
              <Plus size={18} />
              Создать раздел регламента
            </button>
          )}
        </div>
      </div>

      {/* Rulebook Meta Header Banner Card */}
      <div
        className="panel admin-panel-section"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <Calendar size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>
              Редакция: <strong style={{ color: 'var(--text-primary)' }}>{settings.rulebookEdition || '2026 Update #2 (v2.4)'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <Clock size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>
              Статус: <strong style={{ color: 'var(--text-primary)' }}>{settings.rulebookStatus || 'Действующая'}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => setIsMetaModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem' }}
        >
          <Edit2 size={14} />
          <span>Редактировать редакцию и статус</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`admin-btn ${activeTab === 'changelog' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setActiveTab('changelog')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Layers size={16} />
          <span>Список изменений (Changelog)</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
            }}
          >
            {changelog.length}
          </span>
        </button>

        <button
          type="button"
          className={`admin-btn ${activeTab === 'sections' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          onClick={() => setActiveTab('sections')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={16} />
          <span>Разделы регламента (Sections)</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
            }}
          >
            {rules.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CHANGELOG MANAGEMENT */}
      {activeTab === 'changelog' && (
        <div className="admin-panel-section panel">
          {changelog.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {changelog.map((item) => {
                let badgeColor = '#60a5fa';
                let badgeBg = 'rgba(59, 130, 246, 0.12)';
                let badgeLabel = '~ Изменено';

                if (item.type === 'added') {
                  badgeColor = '#34d399';
                  badgeBg = 'rgba(16, 185, 129, 0.12)';
                  badgeLabel = '+ Добавлено';
                } else if (item.type === 'clarified') {
                  badgeColor = '#facc15';
                  badgeBg = 'rgba(234, 179, 8, 0.12)';
                  badgeLabel = 'i Уточнено';
                } else if (item.type === 'removed') {
                  badgeColor = '#f87171';
                  badgeBg = 'rgba(239, 68, 68, 0.12)';
                  badgeLabel = '- Удалено';
                }

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            color: 'var(--text-primary)',
                          }}
                        >
                          § {item.sectionNumber}
                        </span>

                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeColor}40`,
                          }}
                        >
                          {badgeLabel}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                          {item.category} {item.sectionTitle ? `• ${item.sectionTitle}` : ''}
                        </span>
                      </div>

                      <div className="admin-table-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          onClick={() => handleEditChangelog(item)}
                          title="Редактировать"
                          style={{ padding: '0.4rem 0.65rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteChangelog(item.id)}
                          title="Удалить"
                          style={{ padding: '0.4rem 0.65rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {item.description}
                      </p>
                    </div>

                    {item.previousNote && (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-tertiary)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '4px',
                          borderLeft: '2px solid rgba(239, 68, 68, 0.5)',
                        }}
                      >
                        <strong style={{ color: '#f87171', marginRight: '0.4rem' }}>Ранее:</strong>
                        {item.previousNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
              <Layers size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                Список изменений пуст
              </h3>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                Все тестовые записи удалены. Вы можете добавить реальные изменения регламента лиги ASCENT.
              </p>
              <button className="admin-btn admin-btn-primary" onClick={handleCreateChangelog}>
                <Plus size={16} />
                Добавить первое изменение
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SECTIONS MANAGEMENT */}
      {activeTab === 'sections' && (
        <div className="admin-panel-section panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {rules.map((section) => (
              <div
                key={section.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} style={{ color: 'var(--primary-color)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                      {section.title}
                    </h2>
                    {section.badge && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308',
                        }}
                      >
                        {section.badge}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                      ({section.rules.length} пунктов)
                    </span>
                  </div>

                  <div className="admin-table-actions">
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => handleEditSection(section)}
                    >
                      <Edit2 size={16} />
                      Редактировать
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {section.rules.map((rule) => (
                    <div
                      key={rule.number}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: 'var(--text-tertiary)',
                          minWidth: '2.5rem',
                        }}
                      >
                        § {rule.number}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '0.5rem' }}>
                          {rule.title}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {rule.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminRuleSectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        section={editingSection}
      />

      <AdminChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
        onSave={handleSaveChangelog}
        editingItem={editingChangelog}
      />

      <AdminRulebookMetaModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={handleSaveMeta}
        initialData={{
          rulebookEdition: settings.rulebookEdition || '2026 Update #2 (v2.4)',
          rulebookStatus: settings.rulebookStatus || 'Действующая',
          rulebookBadge: settings.rulebookBadge || 'Официальный регламент',
          rulebookUrl: settings.rulebookUrl || '',
        }}
      />
    </>
  );
};

export default AdminRules;
