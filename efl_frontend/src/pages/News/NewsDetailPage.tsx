import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Flag, Users, Trophy, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { renderMarkdownLite } from './markdownLite';
import type { NewsInfoBox } from '@/types';
import './NewsDetailPage.css';

const infoBoxIcons: Record<NewsInfoBox['icon'], React.ReactNode> = {
  calendar: <Calendar size={18} />,
  flag: <Flag size={18} />,
  users: <Users size={18} />,
  trophy: <Trophy size={18} />,
};

const NewsDetailPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { news } = useData();

  const article = useMemo(() => {
    return news.find((a) => a.slug === slug);
  }, [news, slug]);

  if (!article) {
    return (
      <section className="news-page">
        <div className="container">
          <div className="panel news-detail__not-found" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <h2>Article Not Found</h2>
            <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
              The requested news publication does not exist or has been removed.
            </p>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/news" className="btn-primary" style={{ display: 'inline-flex' }}>
                Back to News
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const related = news
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => (a.category === article.category ? -1 : 0) - (b.category === article.category ? -1 : 0))
    .slice(0, 3);

  return (
    <section className="news-page">
      <div className="container">
        <span className="news-detail__category">{article.category}</span>
        <h1 className="news-detail__title">{article.title}</h1>

        <div className="news-detail__byline">
          <span className="news-detail__avatar">ASCENT</span>
          <span className="news-detail__author">{article.author}</span>
          <span className="text-tertiary">·</span>
          <span className="text-tertiary">{article.date}</span>
          <span className="text-tertiary">·</span>
          <span className="text-tertiary">{article.readTime}</span>
        </div>

        {/* News cover visual */}
        {article.imageUrl ? (
          <div className="news-detail__cover news-detail__cover--has-image">
            <img src={article.imageUrl} alt={article.title} className="news-detail__cover-img" />
          </div>
        ) : (
          <div className="news-detail__cover" aria-hidden="true" />
        )}

        <div className="news-article">{renderMarkdownLite(article.body)}</div>

        {article.infoBoxes && article.infoBoxes.length > 0 && (
          <div className="news-info-boxes">
            {article.infoBoxes.map((box) => (
              <div key={box.label} className="news-info-box">
                <span className="news-info-box__icon">{infoBoxIcons[box.icon]}</span>
                <div>
                  <span className="news-info-box__label text-tertiary">{box.label}</span>
                  <p className="news-info-box__value">{box.value}</p>
                  {box.subvalue && <span className="text-secondary news-info-box__subvalue">{box.subvalue}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="news-related">
            <span className="news-related__label text-tertiary">Related Articles</span>
            <div className="news-related__grid">
              {related.map((item) => (
                <Link key={item.slug} to={`/news/${item.slug}`} className="panel news-related__card">
                  <span className="text-tertiary news-related__category">{item.category}</span>
                  <p className="news-related__title">{item.title}</p>
                  <div className="news-related__footer">
                    <span className="text-secondary">{item.date}</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsDetailPage;
