import React from 'react';
import { Link } from 'react-router-dom';
import type { StandingGroup } from '@/types';

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

interface StandingsTabProps {
  standings: StandingGroup[];
}

const StandingsTab: React.FC<StandingsTabProps> = ({ standings }) => (
  <div className="standings-tab">
    {standings.map((group) => (
      <div key={group.group} className="panel overview-panel">
        <h3 className="overview-panel__title">{group.group}</h3>
        <div className="standings-table-wrapper">
          <table className="standings-table">
            <thead>
              <tr>
                <th className="standings-table__col-team">Team</th>
                <th className="standings-table__col-stat">W</th>
                <th className="standings-table__col-stat">L</th>
                <th className="standings-table__col-maps">Maps</th>
                <th className="standings-table__col-stat">Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.team}>
                  <td className="standings-table__col-team">
                    <Link
                      to={`/teams/${getTeamSlug(row.team)}`}
                      className="standings-table__team-name hover-text"
                      title={`View ${row.team} profile`}
                      style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {row.team}
                    </Link>
                  </td>
                  <td className="standings-table__col-stat font-medium">{row.wins}</td>
                  <td className="standings-table__col-stat font-medium">{row.losses}</td>
                  <td className="standings-table__col-maps text-secondary">
                    {row.mapsWon}–{row.mapsLost}
                  </td>
                  <td className="standings-table__col-stat standings-table__pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

export default StandingsTab;
