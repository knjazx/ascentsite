import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X, Bold, Heading, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import type { NewsCategory } from '@/types';
import { NEWS_CATEGORIES } from '@/types';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { renderMarkdownLite } from '../../News/markdownLite';
import '../Admin.css';

const PRESET_COVERS = [
  { label: 'CS2 Major Arena', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Esports Championship', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Competitive Gaming Stage', url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80' },
];

const AdminNewsEdit: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { news, addNewsArticle, updateNewsArticle } = useData();
  const { showToast } = useToast();
  
  const isNew = slug === 'new';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Announcements' as NewsCategory,
    author: 'ASCENT Team',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    readTime: '3 min read',
    excerpt: '',
    body: '',
    imageUrl: '',
    featured: false,
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [insertImageUrl, setInsertImageUrl] = useState('');
  const [insertImageAlt, setInsertImageAlt] = useState('');

  useEffect(() => {
    if (!isNew && slug) {
      const existing = news.find(n => n.slug === slug);
      if (existing) {
        setFormData({
          title: existing.title,
          slug: existing.slug,
          category: existing.category,
          author: existing.author,
          date: existing.date,
          readTime: existing.readTime,
          excerpt: existing.excerpt,
          body: existing.body,
          imageUrl: existing.imageUrl || '',
          featured: !!existing.featured,
        });
      } else {
        navigate('/admin/news');
      }
    }
  }, [slug, isNew, news, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (isNew) {
      const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, title: newTitle, slug: newSlug }));
    } else {
      setFormData(prev => ({ ...prev, title: newTitle }));
    }
  };

  // Cover image file upload handler (converts to base64 Data URL)
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be under 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
        showToast('Cover image loaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert image inside article body handler
  const handleInsertImageToBody = (url: string, altText: string) => {
    if (!url.trim()) {
      showToast('Please provide an image URL or upload a file.', 'error');
      return;
    }

    const imageMarkdown = `\n\n![${altText || 'Article image'}](${url})\n\n`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = formData.body.substring(0, start) + imageMarkdown + formData.body.substring(end);
      setFormData(prev => ({ ...prev, body: newBody }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
      }, 50);
    } else {
      setFormData(prev => ({ ...prev, body: prev.body + imageMarkdown }));
    }

    setShowImageModal(false);
    setInsertImageUrl('');
    setInsertImageAlt('');
    showToast('Image inserted into article body!', 'success');
  };

  // Upload file to insert directly into body
  const handleBodyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be under 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleInsertImageToBody(result, file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const insertFormatting = (syntaxBefore: string, syntaxAfter = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.substring(start, end) || 'text';
    const replacement = `${syntaxBefore}${selectedText}${syntaxAfter}`;
    const newBody = formData.body.substring(0, start) + replacement + formData.body.substring(end);
    setFormData(prev => ({ ...prev, body: newBody }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + selectedText.length);
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addNewsArticle({
        ...formData,
      });
      showToast('Article published successfully!', 'success');
    } else if (slug) {
      updateNewsArticle(slug, {
        ...formData,
      });
      showToast('Article updated successfully!', 'success');
    }
    navigate('/admin/news');
  };

  return (
    <div className="admin-news-edit">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <button className="admin-back-btn" onClick={() => navigate('/admin/news')}>
            <ArrowLeft size={20} />
            Back to News
          </button>
          <h1>{isNew ? 'Create News Article' : 'Edit News Article'}</h1>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>
            <Save size={18} />
            Save Article
          </button>
        </div>
      </div>

      <div className="admin-panel-section panel">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Category</label>
              <CustomSelect
                options={NEWS_CATEGORIES.map(c => ({ value: c, label: c }))}
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val as NewsCategory }))}
              />
            </div>
            <div className="admin-form-group">
              <label>Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Date (e.g., July 25, 2026)</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Read Time</label>
              <input
                type="text"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="admin-form-group" style={{ background: 'var(--surface-dark)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              <ImageIcon size={18} />
              Article Cover Image (Hero Banner)
            </label>
            <p className="text-secondary text-xs" style={{ marginBottom: '0.75rem' }}>
              Upload an image from your computer or paste an external image URL.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://example.com/banner.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
                style={{ flex: 1, minWidth: '240px' }}
              />
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/*"
                onChange={handleCoverFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="admin-btn"
                onClick={() => coverFileInputRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)' }}
              >
                <Upload size={16} />
                Upload File
              </button>
              {formData.imageUrl && (
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span className="text-xs text-tertiary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> Presets:
              </span>
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="admin-btn"
                  style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'var(--bg-card)' }}
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Cover Preview */}
            {formData.imageUrl && (
              <div style={{ marginTop: '0.75rem', maxHeight: '180px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img
                  src={formData.imageUrl}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              Feature this article at the top of the News page
            </label>
          </div>

          <div className="admin-form-group">
            <label>Excerpt (Short summary)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              required
            />
          </div>

          {/* Article Body Section with Image & Markdown Toolbar */}
          <div className="admin-form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ margin: 0 }}>Article Body (Markdown & Images)</label>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn"
                  title="Insert Bold Text"
                  style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                  onClick={() => insertFormatting('**', '**')}
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  title="Insert Heading"
                  style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                  onClick={() => insertFormatting('## ')}
                >
                  <Heading size={14} />
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  title="Insert Link"
                  style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                  onClick={() => insertFormatting('[Link Text](', ')')}
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  title="Insert Image inside Body"
                  style={{ padding: '4px 10px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setShowImageModal(true)}
                >
                  <ImageIcon size={14} />
                  Insert Image
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <textarea
                ref={textareaRef}
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows={20}
                required
                style={{ flex: '1 1 340px', fontFamily: 'monospace', minHeight: '350px' }}
                placeholder="Use **bold**, # headings, ![caption](image_url), [links](url), and separate paragraphs with blank lines."
              />
              <div style={{ flex: '1 1 340px', padding: '1.25rem', backgroundColor: 'var(--surface-dark)', borderRadius: '8px', minHeight: '350px', maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Live Article Preview</h3>
                <div className="news-detail-content" style={{ padding: 0 }}>
                  {formData.imageUrl && (
                    <div style={{ marginBottom: '1rem', borderRadius: '6px', overflow: 'hidden', maxHeight: '160px' }}>
                      <img src={formData.imageUrl} alt="Article Cover" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    </div>
                  )}
                  {renderMarkdownLite(formData.body || '*Preview will appear here*')}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Insert Image Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="panel"
            style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', backgroundColor: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={20} />
                Insert Image into Article
              </h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setShowImageModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-field" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Upload Image File</label>
              <input
                type="file"
                ref={bodyFileInputRef}
                accept="image/*"
                onChange={handleBodyFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                onClick={() => bodyFileInputRef.current?.click()}
              >
                <Upload size={16} /> Choose File from Computer
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '0.75rem 0', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              — OR ENTER IMAGE URL —
            </div>

            <div className="form-field" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Image URL</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://example.com/screenshot.jpg"
                value={insertImageUrl}
                onChange={(e) => setInsertImageUrl(e.target.value)}
              />
            </div>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Caption / Description (Alt text)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Spirit lifting the trophy in Grand Finals"
                value={insertImageAlt}
                onChange={(e) => setInsertImageAlt(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleInsertImageToBody(insertImageUrl, insertImageAlt)}
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsEdit;
