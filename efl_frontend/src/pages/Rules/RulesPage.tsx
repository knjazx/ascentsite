import React, { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  X,
  BookOpen,
  DollarSign,
  Gamepad2,
  ShieldCheck,
  Users,
  Gavel,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import type {
  ChangelogItem,
  ChangelogCategory,
  ChangelogType,
} from '@/data/mocks/rulesChangelogData';
import './RulesPage.css';

interface CategoryConfig {
  key: ChangelogCategory;
  title: string;
  shortLabel: string;
  icon: React.ReactNode;
  order: number;
}

const CATEGORIES: Record<ChangelogCategory, CategoryConfig> = {
  'General': {
    key: 'General',
    title: '1. Общие положения и регламентная база',
    shortLabel: 'Общие правила',
    icon: <BookOpen size={15} />,
    order: 1,
  },
  'Sponsorship & Branding': {
    key: 'Sponsorship & Branding',
    title: '2. Спонсорские нормы и брендинг',
    shortLabel: 'Спонсорство',
    icon: <DollarSign size={15} />,
    order: 2,
  },
  'Match Operations': {
    key: 'Match Operations',
    title: '3. Регламент проведения матчей и коммуникации',
    shortLabel: 'Матчи и регламент',
    icon: <Gamepad2 size={15} />,
    order: 3,
  },
  'Integrity & Anti-Cheat': {
    key: 'Integrity & Anti-Cheat',
    title: '4. Античит-контроль и честность соревнований (VAC)',
    shortLabel: 'Античит и честность',
    icon: <ShieldCheck size={15} />,
    order: 4,
  },
  'Teams & Rosters': {
    key: 'Teams & Rosters',
    title: '5. Составы команд и слоты регистрации',
    shortLabel: 'Составы и слоты',
    icon: <Users size={15} />,
    order: 5,
  },
  'Penalties & Winnings': {
    key: 'Penalties & Winnings',
    title: '6. Финансовые удержания и штрафные санкции',
    shortLabel: 'Штрафы и выплаты',
    icon: <Gavel size={15} />,
    order: 6,
  },
};

const RulesPage: React.FC = () => {
  const { changelog, settings } = useData();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ChangelogCategory>('all');
  const [selectedType, setSelectedType] = useState<'all' | ChangelogType>('all');

  const officialDocUrl =
    settings.rulebookUrl ||
    'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing';

  // Filter changelog entries
  const filteredChanges = useMemo(() => {
    return changelog.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inNum = item.sectionNumber.toLowerCase().includes(query);
        const inSecTitle = item.sectionTitle?.toLowerCase().includes(query) ?? false;
        const inTitle = item.title.toLowerCase().includes(query);
        const inDesc = item.description.toLowerCase().includes(query);
        const inPrev = item.previousNote?.toLowerCase().includes(query) ?? false;
        if (!inNum && !inSecTitle && !inTitle && !inDesc && !inPrev) {
          return false;
        }
      }
      return true;
    });
  }, [changelog, selectedType, selectedCategory, searchQuery]);

  // Counts by change type
  const typeCounts = useMemo(() => {
    const counts = {
      all: changelog.length,
      added: 0,
      modified: 0,
      clarified: 0,
      removed: 0,
    };
    changelog.forEach((item) => {
      if (counts[item.type] !== undefined) {
        counts[item.type] += 1;
      }
    });
    return counts;
  }, [changelog]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    changelog.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [changelog]);

  // Grouped chapters for structured layout (like ESL)
  const groupedChapters = useMemo(() => {
    const map = new Map<ChangelogCategory, ChangelogItem[]>();

    filteredChanges.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category)!.push(item);
    });

    const orderedCategories = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);

    return orderedCategories
      .filter((cat) => map.has(cat.key) && map.get(cat.key)!.length > 0)
      .map((cat) => ({
        ...cat,
        items: map.get(cat.key)!,
      }));
  }, [filteredChanges]);

  const renderChangelogItem = (change: ChangelogItem) => {
    let typeClass = 'changelog-type-pill--modified';
    let typeLabel = '~ Изменено';
    let itemModClass = 'changelog-item--modified';

    if (change.type === 'added') {
      typeClass = 'changelog-type-pill--added';
      typeLabel = '+ Добавлено';
      itemModClass = 'changelog-item--added';
    } else if (change.type === 'clarified') {
      typeClass = 'changelog-type-pill--clarified';
      typeLabel = 'i Уточнено';
      itemModClass = 'changelog-item--clarified';
    } else if (change.type === 'removed') {
      typeClass = 'changelog-type-pill--removed';
      typeLabel = '- Удалено';
      itemModClass = 'changelog-item--removed';
    }

    return (
      <article key={change.id} className={`changelog-item ${itemModClass}`}>
        <div className="changelog-item__top">
          <div className="changelog-item__meta-left">
            <span className="changelog-section-pill">§ {change.sectionNumber}</span>
            {change.sectionTitle && (
              <span className="changelog-section-title">{change.sectionTitle}</span>
            )}
          </div>

          <span className={`changelog-type-pill ${typeClass}`}>{typeLabel}</span>
        </div>

        <h4 className="changelog-item__title">{change.title}</h4>
        <p className="changelog-item__desc">{change.description}</p>

        {change.previousNote && (
          <div className="changelog-diff-callout">
            <span className="changelog-diff-tag">Было ранее:</span>
            <span className="changelog-diff-text">{change.previousNote}</span>
          </div>
        )}

        {change.details && change.details.length > 0 && (
          <ul className="changelog-details-list">
            {change.details.map((detail, idx) => (
              <li key={idx} className="changelog-detail-point">
                <CheckCircle2 size={13} className="changelog-detail-icon" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    );
  };

  return (
    <section className="rules-page">
      <div className="container">
        {/* ==============================================================
            1. HERO SECTION (ESL Pro Tour Style)
           ============================================================== */}
        <header className="rules-hero">
          <h1 className="rules-hero__title">ASCENT Counter-Strike Rulebook — Changelog</h1>
          <p className="rules-hero__subtitle">
            Официальный свод правил соревнований ASCENT CS2 League. Ниже опубликована хронология всех
            внесенных поправок, новых параграфов и дисциплинарных регламентов для участников.
          </p>

          <div className="rules-hero__meta">
            <div className="rules-hero__meta-item">
              <Calendar size={15} />
              <span>
                Редакция: <strong>{settings.rulebookEdition || '2026 Update #2 (v2.4)'}</strong>
              </span>
            </div>
            <div className="rules-hero__meta-item">
              <Clock size={15} />
              <span>
                Статус: <strong>{settings.rulebookStatus || 'Действующая'}</strong>
              </span>
            </div>
          </div>

          {/* ==============================================================
              2. PROMINENT REGULATION DOCUMENT CTA BANNER (Ссылка на регламент)
             ============================================================== */}
          <div className="rules-document-banner">
            <div className="rules-document-banner__left">
              <div className="rules-document-banner__icon-wrap">
                <FileText size={26} />
              </div>
              <div>
                <h2 className="rules-document-banner__heading">
                  Официальный регламент соревнований ASCENT CS2
                </h2>
                <p className="rules-document-banner__subtext">
                  Полный нормативный документ, регулирующий права участников, расписание матчей,
                  трансферные правила, вето карт, античит-контроль и распределение выплат.
                </p>
              </div>
            </div>

            <div className="rules-document-banner__actions">
              <a
                href={officialDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rules-btn-primary"
              >
                <ExternalLink size={16} />
                <span>Открыть официальный регламент (Google Docs / PDF)</span>
              </a>
            </div>
          </div>
        </header>

        {/* ==============================================================
            3. CHANGELOG SECTION (Clean Toolbar & Grouped Entries)
           ============================================================== */}
        <div className="rules-changelog-section">
          {/* Header & Stat Pills */}
          <div className="rules-changelog-header">
            <div className="rules-changelog-header__title-wrap">
              <div className="rules-changelog-header__badge">
                <Layers size={14} />
                <span>Хронология поправок</span>
              </div>
              <h2 className="rules-changelog-header__title">Список изменений регламента</h2>
            </div>

            {changelog.length > 0 && (
              <div className="rules-changelog-header__stats">
                <div className="rules-stat-pill">
                  <span className="rules-stat-pill__num">{changelog.length}</span>
                  <span className="rules-stat-pill__label">всего изменений</span>
                </div>
                {typeCounts.added > 0 && (
                  <div className="rules-stat-pill rules-stat-pill--added">
                    <span className="rules-stat-pill__num">+{typeCounts.added}</span>
                    <span className="rules-stat-pill__label">добавлено</span>
                  </div>
                )}
                {typeCounts.modified > 0 && (
                  <div className="rules-stat-pill rules-stat-pill--modified">
                    <span className="rules-stat-pill__num">~{typeCounts.modified}</span>
                    <span className="rules-stat-pill__label">изменено</span>
                  </div>
                )}
                {typeCounts.clarified > 0 && (
                  <div className="rules-stat-pill rules-stat-pill--clarified">
                    <span className="rules-stat-pill__num">i{typeCounts.clarified}</span>
                    <span className="rules-stat-pill__label">уточнено</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clean Redesigned Toolbar */}
          {changelog.length > 0 && (
            <div className="rules-toolbar-clean">
              <div className="rules-toolbar-clean__main">
                {/* Search */}
                <div className="rules-search-clean">
                  <Search size={16} className="rules-search-clean__icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по номеру статьи, названию или тексту..."
                    className="rules-search-clean__input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="rules-search-clean__clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Очистить поиск"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className="rules-clean-type-pills">
                  <button
                    type="button"
                    className={`rules-clean-pill ${selectedType === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedType('all')}
                  >
                    Все ({typeCounts.all})
                  </button>
                  {typeCounts.added > 0 && (
                    <button
                      type="button"
                      className={`rules-clean-pill rules-clean-pill--added ${selectedType === 'added' ? 'active' : ''}`}
                      onClick={() => setSelectedType(selectedType === 'added' ? 'all' : 'added')}
                    >
                      + Добавлено ({typeCounts.added})
                    </button>
                  )}
                  {typeCounts.modified > 0 && (
                    <button
                      type="button"
                      className={`rules-clean-pill rules-clean-pill--modified ${selectedType === 'modified' ? 'active' : ''}`}
                      onClick={() => setSelectedType(selectedType === 'modified' ? 'all' : 'modified')}
                    >
                      ~ Изменено ({typeCounts.modified})
                    </button>
                  )}
                  {typeCounts.clarified > 0 && (
                    <button
                      type="button"
                      className={`rules-clean-pill rules-clean-pill--clarified ${selectedType === 'clarified' ? 'active' : ''}`}
                      onClick={() => setSelectedType(selectedType === 'clarified' ? 'all' : 'clarified')}
                    >
                      i Уточнено ({typeCounts.clarified})
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Row (Only shown if more than 1 category has items) */}
              {Object.keys(categoryCounts).length > 1 && (
                <div className="rules-toolbar-clean__categories">
                  <button
                    type="button"
                    className={`rules-clean-cat-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Все главы ({changelog.length})
                  </button>
                  {Object.values(CATEGORIES).map((cat) => {
                    const count = categoryCounts[cat.key] || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        className={`rules-clean-cat-chip ${selectedCategory === cat.key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)}
                      >
                        {cat.icon}
                        <span>{cat.shortLabel}</span>
                        <span className="rules-clean-cat-chip__count">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Main Changelog Display */}
          {changelog.length > 0 ? (
            filteredChanges.length > 0 ? (
              <div className="changelog-groups">
                {groupedChapters.map((chapter) => (
                  <section key={chapter.key} className="changelog-chapter">
                    <div className="changelog-chapter__header">
                      <div className="changelog-chapter__left">
                        <span className="changelog-chapter__icon">{chapter.icon}</span>
                        <h3 className="changelog-chapter__title">{chapter.title}</h3>
                      </div>
                      <span className="changelog-chapter__count">
                        {chapter.items.length}{' '}
                        {chapter.items.length === 1
                          ? 'пункт'
                          : chapter.items.length < 5
                          ? 'пункта'
                          : 'пунктов'}
                      </span>
                    </div>

                    <div className="changelog-chapter__items">
                      {chapter.items.map((item) => renderChangelogItem(item))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="changelog-empty-state">
                <Search size={32} />
                <p>По вашему поисковому запросу ничего не найдено.</p>
              </div>
            )
          ) : (
            <div className="changelog-empty-state">
              <Layers size={36} />
              <p>Список изменений пока пуст</p>
            </div>
          )}
        </div>

        {/* ==============================================================
            4. WARNING / DISCIPLINARY BANNER
           ============================================================== */}
        <div className="rules-warning-banner">
          <AlertTriangle size={20} className="rules-warning-banner__icon" />
          <p>
            <strong>Важное уведомление о соблюдении правил:</strong> Незнание официального
            регламента соревнований не освобождает от дисциплинарной ответственности. Регистрируясь
            на турниры и матчи ASCENT, каждый участник, капитан и организация автоматически соглашаются
            со всеми пунктами действующего регламента и решениями судейской коллегии.
          </p>
        </div>

        {/* ==============================================================
            5. FOOTER APPEALS & CONTACT CTA
           ============================================================== */}
        <div className="rules-footer-cta panel">
          <div className="rules-footer-cta__content">
            <h2 className="rules-footer-cta__title">Вопросы по регламенту или апелляция?</h2>
            <p className="rules-footer-cta__text">
              Если у вас возникли вопросы по трактовке правил или вы хотите подать протест по
              итогам матча, обратитесь в судейский комитет ASCENT на официальном сервере Discord.
              Апелляции принимаются в течение 48 часов после завершения игры.
            </p>
          </div>
          <div className="rules-footer-cta__actions">
            <a
              href={settings.discordUrl || 'https://discord.gg/pzdeyZJQzG'}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Судейский канал в Discord</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesPage;
