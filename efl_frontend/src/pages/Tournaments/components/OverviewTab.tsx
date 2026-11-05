import React from 'react';
import { ArrowUpRight, Trophy } from 'lucide-react';
import type { TournamentDetail } from '@/types';
import BracketPreview from './BracketPreview';
import TeamsGrid from './TeamsGrid';

interface OverviewTabProps {
  tournament: TournamentDetail;
  onViewAllTeams?: () => void;
  onViewBracket?: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ tournament, onViewAllTeams, onViewBracket }) => {
  const infoRows = [
    { label: 'Organizer', value: tournament.organizer },
    { label: 'Game', value: tournament.game },
    { label: 'Region', value: tournament.region },
    { label: 'Format', value: tournament.format },
    { label: 'Match Format', value: tournament.matchFormat },
    { label: 'Server', value: tournament.server },
    { label: 'Anticheat', value: tournament.anticheat },
  ];

  return (
    <div className="overview-tab">
      <div className="overview-tab__col overview-tab__col--left">
        <div className="panel overview-panel overview-panel--about">
          <h3 className="overview-panel__title">About the tournament</h3>
          {tournament.description.map((p, i) => (
            <p key={i} className="text-secondary overview-panel__text">
              {p}
            </p>
          ))}
          <div className="overview-panel__badges">
            {tournament.badges.map((b) => (
              <span key={b} className="overview-badge">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="panel overview-panel overview-panel--prize">
          <div className="overview-panel__prize-content">
            <h3 className="overview-panel__title">Prize Pool</h3>
            <p className="overview-panel__prize">{tournament.prizePool}</p>
          </div>
          <Trophy size={140} className="overview-panel__prize-icon" />
        </div>
      </div>

      <div className="overview-tab__col overview-tab__col--center">
        <div className="panel overview-panel">
          <div className="overview-panel__header">
            <h3 className="overview-panel__title">Tournament Bracket</h3>
            <button type="button" className="overview-panel__link" onClick={onViewBracket}>
              View Full Bracket
              <ArrowUpRight size={14} />
            </button>
          </div>
          <BracketPreview groups={tournament.groups} />
        </div>
      </div>

      <div className="overview-tab__col overview-tab__col--right">
        <div className="panel overview-panel">
          <h3 className="overview-panel__title">Tournament Info</h3>
          <dl className="info-rows">
            {infoRows.map((row) => (
              <div key={row.label} className="info-rows__row">
                <dt className="text-tertiary">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="panel overview-panel overview-tab__teams">
        <h3 className="overview-panel__title">Participating Teams</h3>
        <TeamsGrid teams={tournament.participatingTeams} limit={11} onShowMore={onViewAllTeams} />
      </div>

      <div className="panel overview-panel overview-tab__stage">
        <h3 className="overview-panel__title">Stage Progress</h3>
        <div className="stage-progress">
          {tournament.stageProgress.map((stage) => (
            <div key={stage.label} className="stage-progress__item">
              <div className="stage-progress__header">
                <div>
                  <p className="stage-progress__label">{stage.label}</p>
                  <span className="text-secondary stage-progress__dates">{stage.dateRange}</span>
                </div>
                <span className={`stage-progress__status stage-progress__status--${stage.status}`}>
                  {stage.status === 'in-progress'
                    ? 'In Progress'
                    : stage.status === 'completed'
                      ? 'Completed'
                      : 'Upcoming'}
                </span>
              </div>
              {stage.status === 'in-progress' && (
                <div className="stage-progress__bar">
                  <div className="stage-progress__bar-fill" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
