import React from 'react';
import { Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy } from 'lucide-react';

const teamIcons = [Shield, ShieldCheck, Award, Box, Swords, Target, Star, Trophy];

function iconForTeam(name: string) {
  const hash = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return teamIcons[hash % teamIcons.length];
}

interface TeamIconProps {
  name: string;
}

const TeamIcon: React.FC<TeamIconProps> = ({ name }) => {
  const Icon = iconForTeam(name);
  return (
    <span className="match-team-icon" aria-hidden="true">
      <Icon size={14} />
    </span>
  );
};

export default TeamIcon;
