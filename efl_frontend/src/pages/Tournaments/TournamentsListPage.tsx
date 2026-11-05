import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Flag } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import TournamentIconBox from './components/TournamentIconBox';
import StatusDot from './components/StatusDot';
import { useData } from '@/context/DataContext';
import type { TournamentStatus } from '@/types';
import './TournamentsListPage.css';

type FilterTab = 'all' | TournamentStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const TournamentsListPage: React.FC = () => {
  const { tournaments } = useData();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [season, setSeason] = useState('all');

  const seasonOptions = useMemo(() => {
    const unique = Array.from(new Set(tournaments.map((t) => t.season)));
    const filteredSeasons = unique.filter((s) => s.toLowerCase() !== 'all seasons');
    return [
      { value: 'all', label: 'All Seasons' },
      ...filteredSeasons.map((s) => ({ value: s, label: s })),
    ];
  }, [tournaments]);

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesTab = activeTab === 'all' || t.status === activeTab;
      const matchesSeason = season === 'all' || t.season === season;
      return matchesTab && matchesSeason;
    });
  }, [tournaments, activeTab, season]);

  return (
    <section className="tournaments-page">
      <div className="container">
        <div className="tournaments-filters">
          <div className="tabs-header tournaments-filters__tabs">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <CustomSelect
            value={season}
            onChange={setSeason}
            options={seasonOptions}
            className="season-select-wrapper"
          />
        </div>

        <div className="tournament-list">
          {filtered.map((tournament) => (
            <Link key={tournament.slug} to={`/tournaments/${tournament.slug}`} className="tournament-row panel">
              <div className="tournament-row__main">
                <TournamentIconBox icon={tournament.icon} />
                <div>
                  <p className="tournament-row__name">{tournament.name}</p>
                  <span className="tournament-row__type text-secondary">{tournament.type}</span>
                </div>
              </div>

              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Users size={14} />
                  Teams
                </span>
                <span className="tournament-meta__value">{tournament.teams}</span>
              </div>

              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Calendar size={14} />
                  Dates
                </span>
                <span className="tournament-meta__value">{tournament.dateRange}</span>
              </div>

              <div className="tournament-meta">
                <span className="tournament-meta__label text-tertiary">
                  <Flag size={14} />
                  Format
                </span>
                <span className="tournament-meta__value">{tournament.format}</span>
              </div>

              <div className="tournament-meta">
                <StatusDot status={tournament.status} label={tournament.status} />
                <span className="tournament-meta__value">{tournament.statusLabel}</span>
              </div>

              <ArrowRight size={18} className="tournament-row__arrow" />
            </Link>
          ))}

          {filtered.length === 0 && <p className="text-secondary tournament-list__empty">No tournaments found.</p>}
        </div>
      </div>
    </section>
  );
};

export default TournamentsListPage;