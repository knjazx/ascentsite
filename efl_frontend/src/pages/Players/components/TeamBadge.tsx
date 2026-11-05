import React from 'react';
import { Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy } from 'lucide-react';

const teamIcons = [Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy];

function iconForTeam(name: string) {
  const hash = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return teamIcons[hash % teamIcons.length];
}

interface TeamBadgeProps {
  name: string;
}

const TeamBadge: React.FC<TeamBadgeProps> = ({ name }) => {
  const Icon = iconForTeam(name);
  return (
    <span className="player-team">
      <span className="player-team__logo" aria-hidden="true">
        <Icon size={14} />
      </span>
      {name}
    </span>
  );
};

export default TeamBadge;
