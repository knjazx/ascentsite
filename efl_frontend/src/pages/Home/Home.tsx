import React, { useMemo } from 'react';
import { Calendar, Trophy, Bookmark } from 'lucide-react';
import HeroSection from './Components/HeroSection';
import InfoCards, { type InfoCardItem } from './Components/InfoCards';
import ResultsPanel from './Components/ResultsPanel';
import MatchesPanel from './Components/MatchesPanel';
import CtaSection from './Components/CtaSection';
import { useData } from '../../context/DataContext';
import './Home.css';

const Home: React.FC = () => {
  const { matches, tournaments, seasons, settings } = useData();

  // Dynamic upcoming matches
  const dynamicUpcoming = useMemo(() => {
    const upcomingList = matches.filter((m) => m.status === 'upcoming' || m.status === 'live');
    if (upcomingList.length === 0) {
      return matches.slice(0, 5).map((m) => ({
        id: m.id,
        teamA: m.teamA,
        teamB: m.teamB,
        time: m.time ? `${m.date} · ${m.time}` : m.date,
        tournamentSlug: m.tournamentSlug,
      }));
    }
    return upcomingList.slice(0, 5).map((m) => ({
      id: m.id,
      teamA: m.teamA,
      teamB: m.teamB,
      time: m.status === 'live' ? 'LIVE NOW' : (m.time ? `${m.date} · ${m.time}` : m.date),
      tournamentSlug: m.tournamentSlug,
    }));
  }, [matches]);

  // Dynamic completed results
  const dynamicResults = useMemo(() => {
    const completedList = matches.filter((m) => m.status === 'completed');
    if (completedList.length === 0) {
      return [];
    }
    return completedList.slice(0, 5).map((m) => ({
      id: m.id,
      teamA: m.teamA,
      teamB: m.teamB,
      scoreA: m.scoreA ?? 13,
      scoreB: m.scoreB ?? 9,
      timeAgo: m.date || 'Finished',
      tournamentSlug: m.tournamentSlug,
    }));
  }, [matches]);

  // Current active tournament & season
  const activeTournament = useMemo(() => {
    return tournaments.find((t) => t.status === 'ongoing') || tournaments[0] || {
      name: 'ASCENT Season One',
      statusLabel: 'Group Stage',
    };
  }, [tournaments]);

  const activeSeason = useMemo(() => {
    const current = seasons.find((s) => s.isCurrent) || seasons[0];
    if (current) {
      return {
        title: current.name,
        subtitle: `${current.startDate} – ${current.endDate}`,
      };
    }
    return {
      title: settings.currentSeason || 'Season One',
      subtitle: 'May – August 2025',
    };
  }, [seasons, settings]);

  const nextMatch = dynamicUpcoming[0] || {
    teamA: 'Spirit',
    teamB: 'Falcons',
    time: 'Today · 16:00 UTC',
  };

  const infoItems: InfoCardItem[] = [
    {
      icon: <Calendar size={20} />,
      label: 'Upcoming match',
      title: `${nextMatch.teamA} vs ${nextMatch.teamB}`,
      subtitle: nextMatch.time,
    },
    {
      icon: <Trophy size={20} />,
      label: 'Current tournament',
      title: activeTournament.name,
      subtitle: activeTournament.statusLabel || 'Group Stage',
    },
    {
      icon: <Bookmark size={20} />,
      label: 'Current season',
      title: activeSeason.title,
      subtitle: activeSeason.subtitle,
    },
  ];

  return (
    <>
      <HeroSection />

      <div className="container">
        <InfoCards items={infoItems} />

        <div className="home-panels">
          <ResultsPanel results={dynamicResults} />
          <MatchesPanel matches={dynamicUpcoming} />
        </div>

        <CtaSection />
      </div>
    </>
  );
};

export default Home;
