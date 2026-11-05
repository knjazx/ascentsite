import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy } from 'lucide-react';
import type { TournamentTeamRef } from '@/types';

const teamIcons = [Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy];

function iconForTeam(name: string) {
  const hash = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return teamIcons[hash % teamIcons.length];
}

function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

interface TeamsGridProps {
  teams: TournamentTeamRef[];
  /** Show only the first N teams and a "+N more" tile instead of the full list */
  limit?: number;
  /** Called when the "+N more" tile is clicked — ignored if `limit` isn't set */
  onShowMore?: () => void;
}

const TeamsGrid: React.FC<TeamsGridProps> = ({ teams, limit, onShowMore }) => {
  const visible = limit ? teams.slice(0, limit) : teams;
  const remaining = limit ? teams.length - visible.length : 0;

  return (
    <div className="teams-grid">
      {visible.map((team) => {
        const Icon = iconForTeam(team.name);
        const slug = getTeamSlug(team.name);
        return (
          <Link
            key={team.name}
            to={`/teams/${slug}`}
            className="team-tile hover-bg"
            title={`View ${team.name} profile`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className="team-tile__logo" aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className="team-tile__name">{team.name}</span>
          </Link>
        );
      })}

      {remaining > 0 && (
        <button type="button" className="team-tile team-tile--more" onClick={onShowMore}>
          <span className="team-tile__more-count">+{remaining}</span>
          <span className="team-tile__name">More Teams</span>
        </button>
      )}
    </div>
  );
};

export default TeamsGrid;
