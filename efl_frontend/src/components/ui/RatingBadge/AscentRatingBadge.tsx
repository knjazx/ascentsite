import React from 'react';
import { getRatingTier } from '@/types';
import './AscentRatingBadge.css';

export interface AscentRatingBadgeProps {
  rating: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AscentRatingBadge: React.FC<AscentRatingBadgeProps> = ({
  rating,
  className = '',
  size = 'md',
}) => {
  const tier = getRatingTier(rating);
  // Bar fill percentage: based on CS2/HLTV standard scale where 2.0 = 100%
  const fillPercent = Math.min(100, Math.max(8, Math.round((rating / 2.0) * 100)));

  return (
    <div
      className={`ascent-rating-badge ascent-rating-badge--${tier} ascent-rating-badge--${size} ${className}`.trim()}
      title={`ASCENT Rating: ${rating.toFixed(2)} (${tier.toUpperCase()})`}
    >
      <span className="ascent-rating-badge__value">{rating.toFixed(2)}</span>
      <div className="ascent-rating-badge__track">
        <div
          className="ascent-rating-badge__bar"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
};

export default AscentRatingBadge;
