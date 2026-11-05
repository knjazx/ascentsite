import React from 'react';
import coinImg from '@/assets/ascent_coin.png';
import './CoinIcon.css';

export interface CoinIconProps {
  size?: number;
  className?: string;
  alt?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({
  size = 16,
  className = '',
  alt = 'AC',
}) => {
  return (
    <img
      src={coinImg}
      alt={alt}
      width={size}
      height={size}
      className={`coin-icon ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="lazy"
    />
  );
};

export default CoinIcon;
