import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import './AdminGate.css';

const GATE_KEY = 'efl-admin-access';
const DEMO_PASSWORD = 'admin'; // Демо-пароль для входу в адмінку

const AdminGate: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(GATE_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem(GATE_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!unlocked) {
    return (
      <div className="admin-gate">
        <div className="panel admin-gate__card">
          <span className="admin-gate__icon">
            <ShieldCheck size={28} />
          </span>
          <h1 className="admin-gate__title">ASCENT Admin Panel</h1>
          <p className="text-secondary admin-gate__text">This area is for league administrators ONLY!</p>

          <form onSubmit={handleSubmit} className="admin-gate__form">
            <div className="admin-gate__input-wrapper">
              <KeyRound size={16} className="admin-gate__input-icon" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="admin-gate__input"
                autoFocus
              />
            </div>

            {error && <p className="admin-gate__error">{error}</p>}

            <button type="submit" className="btn-primary admin-gate__btn">
              Enter Admin Panel
            </button>
          </form>

          <div className="admin-gate__back-container">
            <Link to="/" className="admin-gate__back-link">
              <ArrowLeft size={16} />
              Return to Main Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminGate;
