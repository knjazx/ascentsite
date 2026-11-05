import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import LogoUpload from './components/LogoUpload';
import RosterSection from './components/RosterSection';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import {
  createEmptyPlayer,
  MAIN_ROSTER_SIZE,
  type RosterPlayer,
  type TeamRegistrationValues,
} from '@/types';
import './TeamRegistrationPage.css';

type FormErrors = Partial<
  Record<
    'teamName' | 'teamTag' | 'contactEmail' | 'captainNickname' | 'captainSteamUrl' | 'logo',
    string
  >
> & {
  mainRoster?: Record<number, { nickname?: string; steamUrl?: string }>;
};

function createInitialValues(): TeamRegistrationValues {
  return {
    teamName: '',
    teamTag: '',
    discordLink: '',
    contactEmail: '',
    captainNickname: '',
    captainSteamUrl: '',
    mainRoster: Array.from({ length: MAIN_ROSTER_SIZE }, createEmptyPlayer),
    substitutes: [],
    logo: null,
  };
}

function validate(values: TeamRegistrationValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.teamName.trim()) errors.teamName = 'Enter team name';

  if (!values.teamTag.trim()) {
    errors.teamTag = 'Enter team tag';
  } else if (values.teamTag.length > 5) {
    errors.teamTag = 'Maximum 5 characters';
  }

  if (!values.contactEmail.trim()) {
    errors.contactEmail = 'Enter contact email';
  } else if (!/^\S+@\S+\.\S+$/.test(values.contactEmail)) {
    errors.contactEmail = 'Invalid email address';
  }

  if (!values.captainNickname.trim())
    errors.captainNickname = 'Enter captain nickname';

  if (!values.captainSteamUrl.trim())
    errors.captainSteamUrl = 'Enter Steam profile link';

  const mainRosterErrors: Record<number, { nickname?: string; steamUrl?: string }> = {};

  values.mainRoster.forEach((player, i) => {
    const playerErrors: { nickname?: string; steamUrl?: string } = {};

    if (!player.nickname.trim()) playerErrors.nickname = 'Required field';
    if (!player.steamUrl.trim()) playerErrors.steamUrl = 'Required field';

    if (Object.keys(playerErrors).length > 0) {
      mainRosterErrors[i] = playerErrors;
    }
  });

  if (Object.keys(mainRosterErrors).length > 0) {
    errors.mainRoster = mainRosterErrors;
  }

  return errors;
}

const TeamRegistrationPage: React.FC = () => {
  const [values, setValues] = useState<TeamRegistrationValues>(createInitialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { submitTeamApproval } = useData();
  const { showToast } = useToast();

  const update = <K extends keyof TeamRegistrationValues>(
    key: K,
    value: TeamRegistrationValues[K]
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('Please correct the errors in the form before submitting.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      submitTeamApproval(values);
      showToast('Team registration submitted for admin approval!', 'success');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="register-page">
        <div className="container">
          <div className="panel register-success" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: 640, margin: '2rem auto' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-positive)', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h1 className="register-page__title">Registration Submitted</h1>

            <p className="text-secondary" style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
              We have received the registration application for <strong>{values.teamName}</strong>. 
              Our tournament administrators will review your roster and verify your Steam IDs.
            </p>

            <div className="panel" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-panel-hover)', textAlign: 'left', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <strong>Contact Email:</strong> {values.contactEmail}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <strong>Captain:</strong> {values.captainNickname}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <strong>Roster Size:</strong> {values.mainRoster.filter(p => p.nickname).length} active players
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Link to="/tournaments" className="btn-primary">
                View Tournaments
                <ArrowRight size={16} />
              </Link>
              <Link to="/stats?tab=teams" className="btn-outline">
                <Shield size={16} />
                Explore League Teams
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="register-page">
      <div className="container">
        <div className="register-page__header">
          <h1 className="register-page__title">Register Team</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="panel form-section">
            <h2 className="form-section__title">Team Information</h2>

            <LogoUpload
              value={values.logo}
              onChange={(file) => update('logo', file)}
              error={errors.logo}
            />

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="team-name">
                  Team Name
                </label>

                <input
                  id="team-name"
                  type="text"
                  className="input-field"
                  value={values.teamName}
                  onChange={(e) => update('teamName', e.target.value)}
                />

                {errors.teamName && <p className="form-error">{errors.teamName}</p>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="team-tag">
                  Team Tag
                </label>

                <input
                  id="team-tag"
                  type="text"
                  className="input-field"
                  placeholder="e.g. NXS"
                  maxLength={5}
                  value={values.teamTag}
                  onChange={(e) => update('teamTag', e.target.value.toUpperCase())}
                />

                {errors.teamTag && <p className="form-error">{errors.teamTag}</p>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="contact-email">
                  Contact Email
                </label>

                <input
                  id="contact-email"
                  type="email"
                  className="input-field"
                  value={values.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                />

                {errors.contactEmail && <p className="form-error">{errors.contactEmail}</p>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="discord-link">
                  Team Discord Server (Optional)
                </label>

                <input
                  id="discord-link"
                  type="text"
                  className="input-field"
                  placeholder="https://discord.gg/..."
                  value={values.discordLink}
                  onChange={(e) => update('discordLink', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="panel form-section">
            <h2 className="form-section__title">Team Captain</h2>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="captain-nickname">
                  Captain Nickname
                </label>

                <input
                  id="captain-nickname"
                  type="text"
                  className="input-field"
                  value={values.captainNickname}
                  onChange={(e) => update('captainNickname', e.target.value)}
                />

                {errors.captainNickname && (
                  <p className="form-error">{errors.captainNickname}</p>
                )}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="captain-steam">
                  Captain Steam Profile
                </label>

                <input
                  id="captain-steam"
                  type="text"
                  className="input-field"
                  value={values.captainSteamUrl}
                  onChange={(e) => update('captainSteamUrl', e.target.value)}
                />

                {errors.captainSteamUrl && (
                  <p className="form-error">{errors.captainSteamUrl}</p>
                )}
              </div>
            </div>
          </div>

          <div className="panel form-section">
            <h2 className="form-section__title">Roster</h2>

            <RosterSection
              mainRoster={values.mainRoster}
              substitutes={values.substitutes}
              onMainChange={(players: RosterPlayer[]) => update('mainRoster', players)}
              onSubstitutesChange={(players: RosterPlayer[]) => update('substitutes', players)}
              mainErrors={errors.mainRoster}
            />
          </div>

          <button
            type="submit"
            className="btn-primary form-submit register-form__submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default TeamRegistrationPage;