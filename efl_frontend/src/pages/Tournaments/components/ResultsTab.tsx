import React from 'react';
import { Link } from 'react-router-dom';
import type { ResultMatch } from '@/types';

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

interface ResultsTabProps {
  results: ResultMatch[];
}

const ResultsTab: React.FC<ResultsTabProps> = ({ results }) => (
  <div className="panel overview-panel">
    <h3 className="overview-panel__title">Results</h3>

    {results.length === 0 ? (
      <p className="text-secondary">No results yet.</p>
    ) : (
      <ul className="match-list">
        {results.map((match) => (
          <li key={match.id} className="match-list__row hover-bg">
            <span className="match-list__stage text-tertiary">{match.stage}</span>
            <div className="match-list__teams">
              <Link to={`/teams/${getTeamSlug(match.teamA)}`} className="match-list__team match-list__team--a" title={`View ${match.teamA} profile`}>
                {match.teamA}
              </Link>
              <span className="match-list__score">
                {match.scoreA} : {match.scoreB}
              </span>
              <Link to={`/teams/${getTeamSlug(match.teamB)}`} className="match-list__team match-list__team--b" title={`View ${match.teamB} profile`}>
                {match.teamB}
              </Link>
            </div>
            <span className="match-list__when">
              <span>{match.date}</span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ResultsTab;
