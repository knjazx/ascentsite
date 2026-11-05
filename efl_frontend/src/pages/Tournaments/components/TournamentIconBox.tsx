import React from 'react';
import { Trophy, Target, ShieldCheck, ChevronsDown, Star } from 'lucide-react';
import type { TournamentIcon } from '@/types';

const iconComponents = {
  trophy: Trophy,
  target: Target,
  shield: ShieldCheck,
  chevrons: ChevronsDown,
  star: Star,
};

interface TournamentIconBoxProps {
  icon: TournamentIcon;
  size?: 'sm' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 22,
  lg: 40,
  xl: 100,
};

const TournamentIconBox: React.FC<TournamentIconBoxProps> = ({ icon, size = 'sm' }) => {
  const IconComponent = iconComponents[icon];
  return (
    <div className={`tournament-icon-box tournament-icon-box--${size}`}>
      <IconComponent size={sizeMap[size]} strokeWidth={size === 'xl' ? 1.5 : 2} />
    </div>
  );
};

export default TournamentIconBox;
