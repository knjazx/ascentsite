import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

function validate(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Please enter your email';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Please enter your password';
  }

  return errors;
}

const LoginForm: React.FC = () => {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { showToast } = useToast();
  const { loginUser, loginWithSteam } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      const user = loginUser(values.email, values.email.split('@')[0], 'captain');
      showToast(`Welcome back, ${user.nickname}!`, 'success');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (role: 'captain' | 'player') => {
    if (role === 'captain') {
      loginUser('captain@phoenix.gg', 'BlazeMaster', 'captain');
      showToast('Logged in as Team Captain (BlazeMaster)!', 'success');
    } else {
      loginUser('donk@spirit.gg', 'donk', 'player');
      showToast('Logged in as Player (donk)!', 'success');
    }
    navigate('/profile');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setForgotEmail(values.email);
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast(`Password recovery link sent to ${forgotEmail}`, 'info');
    setShowForgotModal(false);
  };

  return (
    <>
      {/* Primary Steam Login Button */}
      <button
        type="button"
        className="steam-main-auth-btn"
        onClick={() => {
          loginWithSteam({
            nickname: 'BlazeMaster',
            realName: 'Alexander Vance',
            steamId: '76561198299104812',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
            country: 'ru',
            teamName: 'Phoenix Rising',
            teamSlug: 'phoenix-rising',
            role: 'captain',
          });
          showToast('Успешный вход через Steam!', 'success');
          navigate('/profile');
        }}
      >
        <SteamIcon size={20} />
        <span>Войти через Steam</span>
        <span className="steam-auth-badge">CS2 OpenID</span>
      </button>

      <div className="steam-auth-divider">
        <span>или через логин и пароль</span>
      </div>

      {/* Quick Demo Access Bar */}
      <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-secondary text-xs" style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
          QUICK ACCESS DEMO:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.75rem', padding: '4px 8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => handleQuickDemo('captain')}
          >
            <Shield size={12} style={{ color: '#fbbf24' }} />
            Captain Demo
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.75rem', padding: '4px 8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => handleQuickDemo('player')}
          >
            <User size={12} />
            Player Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            className="input-field"
            placeholder="player@example.com"
            value={values.email}
            onChange={(e) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            autoComplete="email"
          />

          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
            autoComplete="current-password"
          />

          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <div className="form-field form-field--row">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={values.remember}
              onChange={(e) =>
                setValues((v) => ({ ...v, remember: e.target.checked }))
              }
            />
            Remember me
          </label>

          <button
            type="button"
            className="auth-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="btn-primary form-submit"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Log In'}
        </button>
      </form>

      {showForgotModal && (
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
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="panel"
            style={{ maxWidth: '420px', width: '100%', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reset Password</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter your email address and we will send you instructions to reset your password.
            </p>
            <form onSubmit={handleSendReset}>
              <div className="form-field">
                <label className="form-label" htmlFor="forgot-email">Account Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input-field"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="player@example.com"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '6px 14px' }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '6px 14px' }}>
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Steam login */}
    </>
  );
};

export default LoginForm;