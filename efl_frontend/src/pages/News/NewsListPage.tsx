import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { NEWS_CATEGORIES, type NewsCategory } from '@/types';
import './NewsListPage.css';

type FilterValue = 'all' | NewsCategory;

const NewsListPage: React.FC = () => {
  const { news } = useData();
  const [filter, setFilter] = useState<FilterValue>('all');

  const featured = useMemo(() => {
    return news.find((a) => a.featured) ?? news[0] ?? {
      slug: 'welcome-to-ascent',
      title: 'Welcome to ASCENT CS2 League',
      category: 'Announcements' as NewsCategory,
      excerpt: 'The premier CS2 competitive ecosystem.',
      date: 'May 1, 2025',
      author: 'ASCENT Team',
      readTime: '3 min read',
      body: 'Welcome to ASCENT Season One.',
    };
  }, [news]);

  const rows = useMemo(() => {
    return news
      .filter((a) => a.slug !== featured.slug)
      .filter((a) => filter === 'all' || a.category === filter);
  }, [news, filter, featured]);

  return (
    <section className="news-page">
      <div className="container">
        {featured && (
          <div className="panel news-featured">
            <div className="news-featured__content">
              <span className="news-featured__category text-tertiary">{featured.category}</span>
              <h2 className="news-featured__title">{featured.title}</h2>
              <p className="text-secondary news-featured__excerpt">{featured.excerpt}</p>
              <Link to={`/news/${featured.slug}`} className="btn-outline news-featured__cta">
                Read Article
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="news-featured__visual" aria-hidden="true">
              <Trophy size={64} className="news-featured__icon" />
            </div>
          </div>
        )}

        <div className="tabs-header news-filters">
          <button
            type="button"
            className={`tab-btn${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {NEWS_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`tab-btn${filter === category ? ' active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="news-list">
          {rows.map((article) => (
            <Link key={article.slug} to={`/news/${article.slug}`} className="news-row panel">
              <span className="news-row__category text-tertiary">{article.category}</span>
              <div className="news-row__main">
                <p className="news-row__title">{article.title}</p>
                <p className="text-secondary news-row__excerpt">{article.excerpt}</p>
              </div>
              <span className="text-secondary news-row__date">{article.date}</span>
              <ArrowRight size={18} className="news-row__arrow" />
            </Link>
          ))}

          {rows.length === 0 && <p className="text-secondary news-list__empty">No articles found in this category.</p>}
        </div>
      </div>
    </section>
  );
};

export default NewsListPage;
