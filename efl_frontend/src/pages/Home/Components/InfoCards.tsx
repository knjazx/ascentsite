import React, { type ReactNode } from 'react';

export interface InfoCardItem {
  icon: ReactNode;
  label: string;
  title: string;
  subtitle: string;
}

const InfoCard: React.FC<InfoCardItem> = ({ icon, label, title, subtitle }) => (
  <div className="info-card panel">
    <div className="info-card__icon">{icon}</div>
    <div className="info-card__body">
      <span className="info-card__label">{label}</span>
      <p className="info-card__title">{title}</p>
      <span className="info-card__subtitle">{subtitle}</span>
    </div>
  </div>
);

interface InfoCardsProps {
  items: InfoCardItem[];
}

const InfoCards: React.FC<InfoCardsProps> = ({ items }) => (
  <div className="info-cards">
    {items.map((item, index) => (
      <InfoCard key={index} {...item} />
    ))}
  </div>
);

export default InfoCards;
