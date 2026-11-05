import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TeamIcon from './components/TeamIcon';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { useData } from '@/context/DataContext';
import type { MatchStatus } from '@/types';
import './MatchesPage.css';

type FilterTab = 'all' | MatchStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const MatchesPage: React.FC = () => {
  const { matches } = useData();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [tournament, setTournament] = useState('all');

  const tournamentOptions = useMemo(() => {
    const names = Array.from(new Set(matches.map((m) => m.tournamentName)));
    return [{ value: 'all', label: 'All Tournaments' }, ...names.map((n) => ({ value: n, label: n }))];
  }, [matches]);

  const rows = useMemo(() => {
    return matches
      .filter((m) => activeTab === 'all' || m.status === activeTab)
      .filter((m) => tournament === 'all' || m.tournamentName === tournament)
      .sort((a, b) => {
        const order: Record<MatchStatus, number> = { live: 0, upcoming: 1, completed: 2 };
        return order[a.status] - order[b.status];
      });
  }, [matches, activeTab, tournament]);

  return (
    <section className="matches-page">
      <div className="container">
        <div className="matches-filters">
          <div className="tabs-header matches-filters__tabs">
            {filterTabs.map(({ key, label }) => (
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

          <CustomSelect value={tournament} onChange={setTournament} options={tournamentOptions} />
        </div>

        <div className="match-list">
          {rows.map((match) => (
            <div key={match.id} className="match-row panel">
              <Link to={`/tournaments/${match.tournamentSlug}`} className="match-row__tournament" title={`View ${match.tournamentName}`}>
                <span className="match-row__tournament-name">{match.tournamentName}</span>
                <span className="text-tertiary match-row__stage">{match.stage}</span>
              </Link>

              <div className="match-row__center">
                <Link
                  to={`/teams/${getTeamSlug(match.teamA)}`}
                  className="match-row__team"
                  title={`View ${match.teamA} profile`}
                >
                  <TeamIcon name={match.teamA} />
                  <span>{match.teamA}</span>
                </Link>

                {match.status === 'completed' ? (
                  <span className="match-row__score">
                    {match.scoreA ?? 0} – {match.scoreB ?? 0}
                  </span>
                ) : (
                  <span className="text-tertiary match-row__vs">vs</span>
                )}

                <Link
                  to={`/teams/${getTeamSlug(match.teamB)}`}
                  className="match-row__team match-row__team--right"
                  title={`View ${match.teamB} profile`}
                >
                  <span>{match.teamB}</span>
                  <TeamIcon name={match.teamB} />
                </Link>
              </div>

              <div className="match-row__meta">
                <span
                  className={`status-dot status-dot--${match.status === 'live' ? 'live' : match.status === 'upcoming' ? 'upcoming' : 'completed'}`}
                >
                  <span className="status-dot__mark" />
                  {match.status === 'live' ? 'Live' : match.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
                <span className="text-secondary match-row__when">
                  {match.date}
                  {match.time ? ` · ${match.time}` : ''}
                </span>
              </div>
            </div>
          ))}

          {rows.length === 0 && <p className="text-secondary match-list__empty">No matches found for this selection.</p>}
        </div>
      </div>
    </section>
  );
};

export default MatchesPage;
