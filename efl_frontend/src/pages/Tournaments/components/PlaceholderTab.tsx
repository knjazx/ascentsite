import React from 'react';

interface PlaceholderTabProps {
  title: string;
  note: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title, note }) => (
  <div className="panel tab-placeholder">
    <h2 className="tab-placeholder__title">{title}</h2>
    <p className="text-secondary tab-placeholder__note">{note}</p>
  </div>
);

export default PlaceholderTab;
