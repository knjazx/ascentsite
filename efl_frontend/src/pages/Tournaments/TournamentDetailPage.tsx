import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, Calendar, Flag, Target, Building2, Share2, Trophy } from 'lucide-react';
import TournamentIconBox from './components/TournamentIconBox';
import OverviewTab from './components/OverviewTab';
import BracketPreview from './components/BracketPreview';
import TeamsGrid from './components/TeamsGrid';
import ScheduleTab from './components/ScheduleTab';
import ResultsTab from './components/ResultsTab';
import StandingsTab from './components/StandingsTab';
import RulesTab from './components/RulesTab';
import { useData, createDefaultTournamentDetail } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './TournamentDetailPage.css';

type DetailTab = 'overview' | 'brackets' | 'teams' | 'schedule' | 'results' | 'standings' | 'rules';

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'brackets', label: 'Brackets' },
  { key: 'teams', label: 'Teams' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'results', label: 'Results' },
  { key: 'standings', label: 'Standings' },
  { key: 'rules', label: 'Rules' },
];

const TournamentDetailPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [shared, setShared] = useState(false);
  const { tournaments, tournamentDetails } = useData();
  const { showToast } = useToast();

  const tournamentSummary = useMemo(() => {
    return tournaments.find((t) => t.slug === slug);
  }, [tournaments, slug]);

  const tournament = useMemo(() => {
    if (tournamentDetails[slug]) {
      return tournamentDetails[slug];
    }
    if (tournamentSummary) {
      return createDefaultTournamentDetail(tournamentSummary);
    }
    return null;
  }, [tournamentDetails, tournamentSummary, slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      showToast('Tournament link copied to clipboard!', 'success');
      setTimeout(() => setShared(false), 2000);
    } catch {
      showToast('Could not copy link automatically.', 'error');
    }
  };

  if (!tournament) {
    return (
      <section className="tournament-detail-page">
        <div className="container">
          <div className="panel tab-placeholder" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <h2 className="tab-placeholder__title">Tournament Not Found</h2>
            <p className="text-secondary tab-placeholder__note">
              The requested tournament does not exist or has been moved.
            </p>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/tournaments" className="btn-primary" style={{ display: 'inline-flex' }}>
                Back to Tournaments
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tournament-detail-page">
      <div className="container">
        <div className="tournament-detail-header">
          <TournamentIconBox icon={tournament.icon} size="xl" />
          <div className="tournament-detail-header__body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <span className="tournament-detail-header__type text-tertiary">{tournament.type}</span>
              {tournament.status === 'upcoming' && (
                <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.875rem' }}>
                  <Trophy size={14} /> Register Team
                </Link>
              )}
            </div>
            <h1 className="tournament-detail-header__title">{tournament.name}</h1>
            <p className="text-secondary tournament-detail-header__tagline">{tournament.tagline}</p>

            <div className="tournament-detail-header__meta">
              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Users size={14} />
                  Teams
                </span>
                <span className="tournament-meta__value">{tournament.teams}</span>
              </div>
              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Calendar size={14} />
                  Dates
                </span>
                <span className="tournament-meta__value">{tournament.dateRange}</span>
              </div>
              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Flag size={14} />
                  Format
                </span>
                <span className="tournament-meta__value">{tournament.format}</span>
              </div>
              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Target size={14} />
                  Current Stage
                </span>
                <span className="tournament-meta__value">{tournament.statusLabel}</span>
              </div>
              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Building2 size={14} />
                  Organizer
                </span>
                <span className="tournament-meta__value">{tournament.organizer}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tournament-detail-tabs">
          <div className="tabs-header tournament-detail-tabs__list">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn-outline tournament-detail-tabs__share" onClick={handleShare}>
            <Share2 size={16} />
            {shared ? 'Copied!' : 'Share'}
          </button>
        </div>

        {activeTab === 'overview' && (
          <OverviewTab
            tournament={tournament}
            onViewAllTeams={() => setActiveTab('teams')}
            onViewBracket={() => setActiveTab('brackets')}
          />
        )}
        {activeTab === 'brackets' && (
          <div className="panel overview-panel">
            <div className="overview-panel__header">
              <h3 className="overview-panel__title">Tournament Bracket</h3>
            </div>
            <BracketPreview groups={tournament.groups} />
          </div>
        )}
        {activeTab === 'teams' && (
          <div className="panel overview-panel">
            <h3 className="overview-panel__title">Participating Teams ({tournament.participatingTeams.length})</h3>
            <TeamsGrid teams={tournament.participatingTeams} />
          </div>
        )}
        {activeTab === 'schedule' && <ScheduleTab matches={tournament.schedule || []} />}
        {activeTab === 'results' && <ResultsTab results={tournament.results || []} />}
        {activeTab === 'standings' && <StandingsTab standings={tournament.standings || []} />}
        {activeTab === 'rules' && <RulesTab sections={tournament.rules || []} />}
      </div>
    </section>
  );
};

export default TournamentDetailPage;
