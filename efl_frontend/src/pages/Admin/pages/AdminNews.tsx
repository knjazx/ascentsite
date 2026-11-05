import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import '../Admin.css';

const AdminNews: React.FC = () => {
  const { news, deleteNewsArticle } = useData();

  const handleDelete = (slug: string) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      deleteNewsArticle(slug);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1>News</h1>
          <p className="admin-page-header__subtitle">Manage announcements, updates, and other news articles.</p>
        </div>
        <div className="admin-page-header__right">
          <Link to="/admin/news/new" className="admin-btn admin-btn-primary">
            <Plus size={18} />
            Create News Article
          </Link>
        </div>
      </div>

      <div className="admin-panel-section panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Date</th>
                <th>Featured</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.slug}>
                  <td style={{ fontWeight: 'var(--fw-medium)' }}>{n.title}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {n.category}
                    </span>
                  </td>
                  <td>{n.author}</td>
                  <td>{n.date}</td>
                  <td>{n.featured ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        to={`/admin/news/${n.slug}`}
                        className="admin-icon-btn"
                        title="Edit Article"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="Delete Article"
                        onClick={() => handleDelete(n.slug)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                    No news articles found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminNews;
