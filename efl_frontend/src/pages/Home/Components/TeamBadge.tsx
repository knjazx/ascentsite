import React from 'react';

interface TeamBadgeProps {
  name: string;
}

// Тимчасовий плейсхолдер лого команди (перша літера назви).
// Коли з'являться реальні лого — заміни span на <img src={logoUrl} className="team-badge" />
const TeamBadge: React.FC<TeamBadgeProps> = ({ name }) => (
  <span className="team-badge" aria-hidden="true">
    {name.charAt(0).toUpperCase()}
  </span>
);

export default TeamBadge;
