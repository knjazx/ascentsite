import React from 'react';
import type { TournamentRuleSection } from '@/types';

interface RulesTabProps {
  sections: TournamentRuleSection[];
}

const RulesTab: React.FC<RulesTabProps> = ({ sections }) => (
  <div className="panel overview-panel">
    <h3 className="overview-panel__title">Rules</h3>

    <div className="rules-list">
      {sections.map((section) => (
        <div key={section.title} className="rules-list__section">
          <h4 className="rules-list__title">{section.title}</h4>
          {section.content.map((paragraph, i) => (
            <p key={i} className="text-secondary rules-list__text">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default RulesTab;
