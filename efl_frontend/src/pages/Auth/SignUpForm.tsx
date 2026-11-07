import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import SteamIcon from '@/components/ui/SteamIcon/SteamIcon';
import { redirectToSteam } from '@/utils/steamAuth';

interface SignUpFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

interface SignUpFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agree?: string;
}

const initialValues: SignUpFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
};

function validate(values: SignUpFormValues): SignUpFormErrors {
  const errors: SignUpFormErrors = {};

  if (!values.username.trim()) {
    errors.username = 'Please enter your username';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!values.agree) {
    errors.agree = 'You must agree to the league rules';
  }

  return errors;
}

const SignUpForm: React.FC = () => {
  const [values, setValues] = useState<SignUpFormValues>(initialValues);
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { loginUser } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      loginUser(values.email, values.username, 'player');
      showToast(`Account successfully created for ${values.username}!`, 'success');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="steam-register-note">
        🛡️ <strong>Официальная регистрация игроков в ASCENT:</strong>
        <p style={{ marginTop: '4px' }}>
          Для участия в турнирах и защиты от читеров регистрация соревновательного профиля производится через <strong>Steam OpenID</strong> с привязкой вашего CS2 аккаунта.
        </p>
      </div>

      {/* Primary Steam Registration Button */}
      <button
        type="button"
        className="steam-main-auth-btn"
        onClick={() => {
          redirectToSteam();
        }}
      >
        <SteamIcon size={20} />
        <span>Зарегистрироваться через Steam</span>
        <span className="steam-auth-badge">Быстро & Безопасно</span>
      </button>

      <div className="steam-auth-divider">
        <span>или регистрация по почте</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="signup-username">
            Игровой никнейм
          </label>

          <input
            id="signup-username"
            type="text"
            className="input-field"
            value={values.username}
            onChange={(e) =>
              setValues((v) => ({ ...v, username: e.target.value }))
            }
            autoComplete="username"
            placeholder="Никнейм игрока"
          />

          {errors.username && <p className="form-error">{errors.username}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="signup-email">
            Email
          </label>

          <input
            id="signup-email"
            type="email"
            className="input-field"
            value={values.email}
            onChange={(e) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            autoComplete="email"
            placeholder="player@example.com"
          />

          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="signup-password">
            Пароль
          </label>

          <input
            id="signup-password"
            type="password"
            className="input-field"
            value={values.password}
            onChange={(e) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
            autoComplete="new-password"
            placeholder="Минимум 6 символов"
          />

          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="signup-confirm-password">
            Повторите пароль
          </label>

          <input
            id="signup-confirm-password"
            type="password"
            className="input-field"
            value={values.confirmPassword}
            onChange={(e) =>
              setValues((v) => ({ ...v, confirmPassword: e.target.value }))
            }
            autoComplete="new-password"
            placeholder="••••••••"
          />

          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-checkbox">
            <input type="checkbox" checked={values.agree} onChange={(e) => setValues((v) => ({ ...v, agree: e.target.checked }))} />
            <span>
              Я согласен с{' '}
              <Link to="/rules" className="auth-link">
                Регламентом лиги ASCENT
              </Link>
            </span>
          </label>

          {errors.agree && <p className="form-error">{errors.agree}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary form-submit"
          disabled={submitting}
        >
          {submitting ? 'Создание аккаунта…' : 'Зарегистрироваться'}
        </button>
      </form>
    </>
  );
};

export default SignUpForm;
