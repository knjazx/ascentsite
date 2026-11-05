import React from 'react';
import type { TeamTier } from '@/types';

interface TierBadgeProps {
  tier: TeamTier;
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => <span className={`tier-badge tier-badge--${tier.toLowerCase()}`}>{tier}</span>;

export default TierBadge;
