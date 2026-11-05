import React from 'react';
import { Link } from 'react-router-dom';
import TeamBadge from './TeamBadge';

export interface PanelMatchResult {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  timeAgo: string;
  tournamentSlug?: string;
}

interface ResultsPanelProps {
  results: PanelMatchResult[];
}

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => (
  <div className="panel home-panel">
    <div className="home-panel__header">
      <h2 className="home-panel__title">Latest Results</h2>
      <Link to="/matches" className="home-panel__view-all">
        View all
      </Link>
    </div>

    <ul className="results-list">
      {results.map((result) => (
        <li key={result.id} className="results-list__row hover-bg">
          <Link to={`/teams/${getTeamSlug(result.teamA)}`} className="results-list__team" title={`View ${result.teamA} profile`}>
            <TeamBadge name={result.teamA} />
            <span>{result.teamA}</span>
          </Link>
          <span className="results-list__score">
            {result.scoreA} – {result.scoreB}
          </span>
          <Link to={`/teams/${getTeamSlug(result.teamB)}`} className="results-list__team results-list__team--right" title={`View ${result.teamB} profile`}>
            <span>{result.teamB}</span>
            <TeamBadge name={result.teamB} />
          </Link>
          <span className="results-list__time text-tertiary">{result.timeAgo}</span>
        </li>
      ))}
      {results.length === 0 && (
        <li className="text-secondary" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
          No recent matches recorded yet.
        </li>
      )}
    </ul>
  </div>
);

export default ResultsPanel;
