import React from 'react';
import type { TournamentStatus } from '@/types';

interface StatusDotProps {
  status: TournamentStatus;
  label: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => (
  <span className={`status-dot status-dot--${status}`}>
    <span className="status-dot__mark" />
    {label}
  </span>
);

export default StatusDot;
