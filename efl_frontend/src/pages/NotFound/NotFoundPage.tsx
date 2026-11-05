import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Swords } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="container not-found-page__container">
        <div className="panel not-found-card">
          <div className="not-found-card__badge">
            <AlertTriangle size={18} />
            <span>ERROR 404 • MAP NOT FOUND</span>
          </div>

          <h1 className="not-found-card__code">404</h1>
          <h2 className="not-found-card__title">Round Lost! Page Not Found</h2>

          <p className="not-found-card__text text-secondary">
            The page you are looking for has been defused, removed, or never existed in the active tournament pool.
          </p>

          <div className="not-found-card__actions">
            <Link to="/" className="btn-primary not-found-btn">
              <Home size={18} />
              Return to Homepage
            </Link>
            <Link to="/matches" className="btn-outline not-found-btn">
              <Swords size={18} />
              View Live Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
