import React from 'react';
import { Link } from 'react-router-dom';
import TeamBadge from './TeamBadge';

export interface PanelUpcomingMatch {
  id: string;
  teamA: string;
  teamB: string;
  time: string;
  tournamentSlug?: string;
}

interface MatchesPanelProps {
  matches: PanelUpcomingMatch[];
}

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const MatchesPanel: React.FC<MatchesPanelProps> = ({ matches }) => (
  <div className="panel home-panel">
    <div className="home-panel__header">
      <h2 className="home-panel__title">Upcoming Matches</h2>
      <Link to="/matches" className="home-panel__view-all">
        View all
      </Link>
    </div>

    <ul className="results-list">
      {matches.map((match) => (
        <li key={match.id} className="results-list__row hover-bg">
          <Link to={`/teams/${getTeamSlug(match.teamA)}`} className="results-list__team" title={`View ${match.teamA} profile`}>
            <TeamBadge name={match.teamA} />
            <span>{match.teamA}</span>
          </Link>
          <span className="results-list__score results-list__score--vs text-tertiary">vs</span>
          <Link to={`/teams/${getTeamSlug(match.teamB)}`} className="results-list__team results-list__team--right" title={`View ${match.teamB} profile`}>
            <span>{match.teamB}</span>
            <TeamBadge name={match.teamB} />
          </Link>
          <span className="results-list__time text-tertiary">{match.time}</span>
        </li>
      ))}
      {matches.length === 0 && (
        <li className="text-secondary" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          No upcoming matches scheduled.
        </li>
      )}
    </ul>
  </div>
);

export default MatchesPanel;
