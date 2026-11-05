import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, User, ExternalLink } from 'lucide-react';
import TeamBadge from './components/TeamBadge';
import AscentRatingBadge from '@/components/ui/RatingBadge/AscentRatingBadge';
import CountryFlag from '@/components/ui/CountryFlag/CountryFlag';
import { useData } from '@/context/DataContext';
import { players as mockPlayers, detailedPlayerProfiles } from '@/data/mocks/playersMockData';
import { getKD, getKDDiff, getPlayerRating, type SortKey, type SortDirection, type PlayerStats, type PlayerProfile } from '@/types';
import './PlayersPage.css';

const columns: { key: SortKey; label: string }[] = [
  { key: 'maps', label: 'Maps' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'kdDiff', label: 'K-D Diff' },
  { key: 'kd', label: 'K/D' },
  { key: 'rating', label: 'ASCENT Rating' },
];

function getSortValue(player: PlayerStats, key: SortKey): number {
  if (key === 'maps') return player.maps;
  if (key === 'rounds') return player.rounds;
  if (key === 'kdDiff') return getKDDiff(player);
  if (key === 'kd') return getKD(player);
  if (key === 'rating') return getPlayerRating(player);
  return 0;
}

const PlayersPage: React.FC = () => {
  const { players: contextPlayers } = useData();
  const allPlayers = contextPlayers && contextPlayers.length > 0 ? contextPlayers : mockPlayers;

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const rows = useMemo(() => {
    const filtered = allPlayers.filter((p) =>
      p.nickname.toLowerCase().includes(search.trim().toLowerCase()) ||
      p.team.toLowerCase().includes(search.trim().toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const diff = getSortValue(a, sortKey) - getSortValue(b, sortKey);
      return sortDir === 'desc' ? -diff : diff;
    });
    return sorted;
  }, [allPlayers, search, sortKey, sortDir]);

  return (
    <section className="players-page">
      <div className="container">
        <div className="players-search">
          <Search size={16} className="players-search__icon" />
          <input
            type="text"
            className="input-field players-search__input"
            placeholder="Search player nickname or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="panel players-table-wrap">
          <table className="data-table players-table">
            <thead>
              <tr>
                <th className="players-table__th--rank">#</th>
                <th>Player</th>
                <th>Team</th>
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="players-table__sortable players-table__th--center"
                  >
                    <span className="players-table__th-inner">
                      {label}
                      {sortKey === key &&
                        (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                    </span>
                  </th>
                ))}
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((player, i) => {
                const kdDiff = getKDDiff(player);
                const playerSlug = player.nickname.toLowerCase();
                const detailed = detailedPlayerProfiles[player.id];
                const teamSlug = player.team.toLowerCase().replace(/\s+/g, '-');

                return (
                  <tr key={player.id} className="players-table__row">
                    <td className="players-table__rank">{i + 1}</td>
                    <td>
                      <Link to={`/players/${playerSlug}`} className="players-table__player-link">
                        <CountryFlag code={playerSlug} size="sm" />
                        <div className="players-table__avatar-mini">
                          {('avatar' in player && (player as PlayerProfile).avatar) ? (
                            <img src={(player as PlayerProfile).avatar} alt={player.nickname} />
                          ) : detailed?.avatar ? (
                            <img src={detailed.avatar} alt={player.nickname} />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <span className="players-table__nickname">{player.nickname}</span>
                      </Link>
                    </td>
                    <td>
                      <Link to={`/teams/${teamSlug}`} className="players-table__team-link">
                        <TeamBadge name={player.team} />
                      </Link>
                    </td>
                    <td className="players-table__td--center">{player.maps}</td>
                    <td className="players-table__td--center">{player.rounds}</td>
                    <td className={`players-table__td--center font-bold ${kdDiff >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {kdDiff >= 0 ? '+' : ''}
                      {kdDiff}
                    </td>
                    <td className="players-table__td--center font-bold">{getKD(player).toFixed(2)}</td>
                    <td className="players-table__td--center players-table__td--rating">
                      <AscentRatingBadge rating={getPlayerRating(player)} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/players/${playerSlug}`}
                        className="players-table__view-btn"
                        title={`View ${player.nickname}'s profile`}
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="players-table__empty text-secondary">
                    No players found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PlayersPage;

