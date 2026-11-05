import React from 'react';
import { Shield, Swords, Target, Flame, Zap, Award } from 'lucide-react';
import './TeamLogo.css';

interface TeamBrand {
  tag: string;
  color: string;
  bgGradient: string;
  border: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const TEAM_BRANDS: Record<string, TeamBrand> = {
  spirit: {
    tag: 'TS',
    color: '#34d399',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
    border: 'rgba(52, 211, 153, 0.4)',
    icon: Flame,
  },
  falcons: {
    tag: 'FLC',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.25) 0%, rgba(6, 78, 59, 0.6) 100%)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: Zap,
  },
  vitality: {
    tag: 'VIT',
    color: '#facc15',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(113, 63, 18, 0.6) 100%)',
    border: 'rgba(250, 204, 21, 0.45)',
    icon: Target,
  },
  'natus-vincere': {
    tag: 'NAVI',
    color: '#fde047',
    bgGradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(20, 20, 20, 0.9) 100%)',
    border: 'rgba(253, 224, 71, 0.5)',
    icon: Swords,
  },
  navi: {
    tag: 'NAVI',
    color: '#fde047',
    bgGradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.3) 0%, rgba(20, 20, 20, 0.9) 100%)',
    border: 'rgba(253, 224, 71, 0.5)',
    icon: Swords,
  },
  mouz: {
    tag: 'MOUZ',
    color: '#f87171',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(69, 10, 10, 0.7) 100%)',
    border: 'rgba(248, 113, 113, 0.4)',
    icon: Target,
  },
  g2: {
    tag: 'G2',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(24, 24, 27, 0.9) 100%)',
    border: 'rgba(239, 68, 68, 0.45)',
    icon: Swords,
  },
  furia: {
    tag: 'FUR',
    color: '#fb7185',
    bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(19, 19, 22, 0.9) 100%)',
    border: 'rgba(251, 113, 133, 0.4)',
    icon: Flame,
  },
  '9z': {
    tag: '9Z',
    color: '#c084fc',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(59, 7, 100, 0.6) 100%)',
    border: 'rgba(192, 132, 252, 0.4)',
    icon: Zap,
  },
  betboom: {
    tag: 'BB',
    color: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, rgba(225, 29, 72, 0.25) 0%, rgba(250, 204, 21, 0.15) 100%)',
    border: 'rgba(244, 63, 94, 0.4)',
    icon: Award,
  },
  aurora: {
    tag: 'AUR',
    color: '#22d3ee',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(12, 74, 110, 0.7) 100%)',
    border: 'rgba(34, 211, 238, 0.4)',
    icon: Shield,
  },
  legacy: {
    tag: 'LGC',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
    border: 'rgba(56, 189, 248, 0.4)',
    icon: Shield,
  },
  fut: {
    tag: 'FUT',
    color: '#fb923c',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(67, 20, 7, 0.7) 100%)',
    border: 'rgba(251, 146, 60, 0.4)',
    icon: Flame,
  },
  parivision: {
    tag: 'PARI',
    color: '#818cf8',
    bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(30, 27, 75, 0.7) 100%)',
    border: 'rgba(129, 140, 248, 0.4)',
    icon: Target,
  },
  'phoenix-rising': {
    tag: 'PHX',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(124, 45, 18, 0.7) 100%)',
    border: 'rgba(249, 115, 22, 0.45)',
    icon: Flame,
  },
  'arctic-wolves': {
    tag: 'AWF',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(8, 47, 73, 0.7) 100%)',
    border: 'rgba(56, 189, 248, 0.4)',
    icon: Shield,
  },
};

function normalizeTeamKey(name: string): string {
  return name.toLowerCase().replace(/[\s\-_]+/g, '');
}

interface TeamLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  logoUrl?: string | null;
  className?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ name, size = 'sm', logoUrl, className = '' }) => {
  if (logoUrl) {
    return (
      <span className={`team-logo team-logo--${size} ${className}`} aria-hidden="true">
        <img src={logoUrl} alt={name} className="team-logo__img" />
      </span>
    );
  }

  const cleanName = (name || '').trim();
  const normalized = normalizeTeamKey(cleanName);

  // Match brand
  let brand: TeamBrand | undefined = undefined;
  for (const [key, b] of Object.entries(TEAM_BRANDS)) {
    if (normalized.includes(key.replace(/[\s\-_]+/g, '')) || key.replace(/[\s\-_]+/g, '').includes(normalized)) {
      brand = b;
      break;
    }
  }

  // Fallback brand derived from name
  if (!brand) {
    const hash = cleanName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const colors = ['#38bdf8', '#34d399', '#facc15', '#f43f5e', '#a855f7', '#fb923c'];
    const chosenColor = colors[hash % colors.length];
    const words = cleanName.split(/\s+/).filter(Boolean);
    const tag = words.length > 1
      ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
      : cleanName.slice(0, 3).toUpperCase() || 'TM';

    brand = {
      tag,
      color: chosenColor,
      bgGradient: `linear-gradient(135deg, ${chosenColor}26 0%, rgba(18, 18, 22, 0.9) 100%)`,
      border: `${chosenColor}55`,
      icon: Shield,
    };
  }

  const TagIcon = brand.icon;
  const isLarge = size === 'xl' || size === 'lg';

  return (
    <span
      className={`team-logo team-logo--${size} ${className}`}
      aria-hidden="true"
      style={{
        background: brand.bgGradient,
        borderColor: brand.border,
      }}
    >
      <span className="team-logo__glow" style={{ background: brand.color }} />
      <span className="team-logo__text" style={{ color: brand.color }}>
        {brand.tag}
      </span>
      {isLarge && TagIcon && (
        <span className="team-logo__mini-icon" style={{ color: brand.color }}>
          <TagIcon size={size === 'xl' ? 14 : 10} />
        </span>
      )}
    </span>
  );
};

export default TeamLogo;
