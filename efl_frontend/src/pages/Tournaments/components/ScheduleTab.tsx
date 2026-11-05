import React from 'react';
import { Link } from 'react-router-dom';
import type { ScheduleMatch } from '@/types';

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

interface ScheduleTabProps {
  matches: ScheduleMatch[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ matches }) => (
  <div className="panel overview-panel">
    <h3 className="overview-panel__title">Schedule</h3>

    {matches.length === 0 ? (
      <p className="text-secondary">No matches scheduled yet.</p>
    ) : (
      <ul className="match-list">
        {matches.map((match) => (
          <li key={match.id} className="match-list__row hover-bg">
            <span className="match-list__stage text-tertiary">{match.stage}</span>
            <div className="match-list__teams">
              <Link to={`/teams/${getTeamSlug(match.teamA)}`} className="match-list__team match-list__team--a" title={`View ${match.teamA} profile`}>
                {match.teamA}
              </Link>
              <span className="match-list__vs">VS</span>
              <Link to={`/teams/${getTeamSlug(match.teamB)}`} className="match-list__team match-list__team--b" title={`View ${match.teamB} profile`}>
                {match.teamB}
              </Link>
            </div>
            <span className="match-list__when">
              <span>{match.date}</span>
              <span className="text-tertiary">{match.time}</span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ScheduleTab;
