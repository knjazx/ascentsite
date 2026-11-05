import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Check } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import type { TournamentDetail, ScheduleMatch, ResultMatch, StandingGroup, StandingRow } from '@/types';
import '../Admin.css';

type AdminDetailTab = 'general' | 'schedule' | 'results' | 'standings';

const AdminTournamentEdit: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { tournaments, tournamentDetails, updateTournamentDetail } = useData();
  const [activeTab, setActiveTab] = useState<AdminDetailTab>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tournamentSummary = tournaments.find((t) => t.slug === slug);
  const detail = tournamentDetails[slug] || (tournamentSummary ? {
    ...tournamentSummary,
    tagline: '',
    description: [],
    badges: [],
    prizePool: '$0',
    organizer: 'ASCENT',
    game: 'CS2',
    region: 'Europe',
    matchFormat: 'BO3',
    server: 'EU Central',
    anticheat: 'VAC / Easy Anti-Cheat',
    groups: ['Group A', 'Group B'],
    stageProgress: [],
    participatingTeams: [],
    schedule: [],
    results: [],
    standings: [],
    rules: [],
  } as TournamentDetail : null);

  // Form State
  const [formState, setFormState] = useState<TournamentDetail | null>(detail);

  if (!tournamentSummary || !formState) {
    return (
      <div className="panel admin-panel-section">
        <h2>Tournament Not Found</h2>
        <p className="text-secondary">The requested tournament does not exist.</p>
        <Link to="/admin/tournaments" className="admin-btn admin-btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Back to Tournaments
        </Link>
      </div>
    );
  }

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveAll = () => {
    if (formState) {
      updateTournamentDetail(slug, formState);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // ── Schedule Match Handlers ─────────────────────────────────────────────
  const handleAddScheduleMatch = () => {
    const newMatch: ScheduleMatch = {
      id: `m-${Date.now()}`,
      stage: 'Group Stage',
      teamA: 'Team A',
      teamB: 'Team B',
      date: 'Aug 20, 2026',
      time: '18:00 EEST',
    };
    setFormState((prev) => prev ? { ...prev, schedule: [...(prev.schedule || []), newMatch] } : null);
  };

  const handleUpdateScheduleMatch = (id: string, patch: Partial<ScheduleMatch>) => {
    setFormState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        schedule: prev.schedule.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
    });
  };

  const handleDeleteScheduleMatch = (id: string) => {
    setFormState((prev) => prev ? { ...prev, schedule: prev.schedule.filter((m) => m.id !== id) } : null);
  };

  // ── Results Match Handlers ──────────────────────────────────────────────
  const handleAddResultMatch = () => {
    const newResult: ResultMatch = {
      id: `r-${Date.now()}`,
      stage: 'Group Stage',
      teamA: 'Team A',
      teamB: 'Team B',
      scoreA: 2,
      scoreB: 1,
      date: 'Aug 15, 2026',
    };
    setFormState((prev) => prev ? { ...prev, results: [...(prev.results || []), newResult] } : null);
  };

  const handleUpdateResultMatch = (id: string, patch: Partial<ResultMatch>) => {
    setFormState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        results: prev.results.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    });
  };

  const handleDeleteResultMatch = (id: string) => {
    setFormState((prev) => prev ? { ...prev, results: prev.results.filter((r) => r.id !== id) } : null);
  };

  // ── Standings Handlers ──────────────────────────────────────────────────
  const handleAddStandingGroup = () => {
    const newGroup: StandingGroup = {
      group: `Group ${String.fromCharCode(65 + (formState.standings?.length || 0))}`,
      rows: [
        { team: 'Team 1', wins: 0, losses: 0, mapsWon: 0, mapsLost: 0, points: 0 },
        { team: 'Team 2', wins: 0, losses: 0, mapsWon: 0, mapsLost: 0, points: 0 },
      ],
    };
    setFormState((prev) => prev ? { ...prev, standings: [...(prev.standings || []), newGroup] } : null);
  };

  const handleUpdateStandingRow = (groupIndex: number, rowIndex: number, patch: Partial<StandingRow>) => {
    setFormState((prev) => {
      if (!prev) return null;
      const nextStandings = [...prev.standings];
      const targetGroup = { ...nextStandings[groupIndex] };
      const nextRows = [...targetGroup.rows];
      nextRows[rowIndex] = { ...nextRows[rowIndex], ...patch };
      targetGroup.rows = nextRows;
      nextStandings[groupIndex] = targetGroup;
      return { ...prev, standings: nextStandings };
    });
  };

  const handleAddRowToGroup = (groupIndex: number) => {
    setFormState((prev) => {
      if (!prev) return null;
      const nextStandings = [...prev.standings];
      const targetGroup = { ...nextStandings[groupIndex] };
      targetGroup.rows = [
        ...targetGroup.rows,
        { team: 'New Team', wins: 0, losses: 0, mapsWon: 0, mapsLost: 0, points: 0 },
      ];
      nextStandings[groupIndex] = targetGroup;
      return { ...prev, standings: nextStandings };
    });
  };

  const handleDeleteStandingRow = (groupIndex: number, rowIndex: number) => {
    setFormState((prev) => {
      if (!prev) return null;
      const nextStandings = [...prev.standings];
      const targetGroup = { ...nextStandings[groupIndex] };
      targetGroup.rows = targetGroup.rows.filter((_, idx) => idx !== rowIndex);
      nextStandings[groupIndex] = targetGroup;
      return { ...prev, standings: nextStandings };
    });
  };

  const handleDeleteGroup = (groupIndex: number) => {
    setFormState((prev) => prev ? { ...prev, standings: prev.standings.filter((_, idx) => idx !== groupIndex) } : null);
  };

  return (
    <>
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <Link to="/admin/tournaments" className="admin-back-link" style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Tournaments List
          </Link>
          <h1>Manage Details: {tournamentSummary.name}</h1>
          <p className="admin-page-header__subtitle">Edit specifications, schedule, results, and standings for this tournament.</p>
        </div>
        <div className="admin-page-header__right">
          <button className="admin-btn admin-btn-primary" onClick={handleSaveAll}>
            {savedSuccess ? <Check size={18} /> : <Save size={18} />}
            {savedSuccess ? 'Saved!' : 'Save All Details'}
          </button>
        </div>
      </div>

      {/* Admin Detail Tabs */}
      <div className="tournament-detail-tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="tabs-header">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General & Specs
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule ({formState.schedule?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Results ({formState.results?.length || 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Standings ({formState.standings?.length || 0} Groups)
          </button>
        </div>
      </div>

      {/* ── TAB 1: General & Specs ── */}
      {activeTab === 'general' && (
        <div className="panel admin-panel-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2>General Specifications</h2>

          <div className="admin-form-group">
            <label>Tagline</label>
            <input
              className="admin-input"
              name="tagline"
              value={formState.tagline || ''}
              onChange={handleGeneralChange}
              placeholder="e.g. Premier CS2 tournament with $50,000 prize pool"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="admin-form-group">
              <label>Prize Pool</label>
              <input
                className="admin-input"
                name="prizePool"
                value={formState.prizePool || ''}
                onChange={handleGeneralChange}
                placeholder="e.g. $50,000"
              />
            </div>
            <div className="admin-form-group">
              <label>Organizer</label>
              <input
                className="admin-input"
                name="organizer"
                value={formState.organizer || ''}
                onChange={handleGeneralChange}
              />
            </div>
            <div className="admin-form-group">
              <label>Game</label>
              <input
                className="admin-input"
                name="game"
                value={formState.game || ''}
                onChange={handleGeneralChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="admin-form-group">
              <label>Region</label>
              <input
                className="admin-input"
                name="region"
                value={formState.region || ''}
                onChange={handleGeneralChange}
              />
            </div>
            <div className="admin-form-group">
              <label>Match Format</label>
              <input
                className="admin-input"
                name="matchFormat"
                value={formState.matchFormat || ''}
                onChange={handleGeneralChange}
                placeholder="e.g. BO3 Playoffs, BO1 Groups"
              />
            </div>
            <div className="admin-form-group">
              <label>Server Region</label>
              <input
                className="admin-input"
                name="server"
                value={formState.server || ''}
                onChange={handleGeneralChange}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Anticheat Requirement</label>
            <input
              className="admin-input"
              name="anticheat"
              value={formState.anticheat || ''}
              onChange={handleGeneralChange}
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: Schedule ── */}
      {activeTab === 'schedule' && (
        <div className="panel admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Scheduled Matches</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleAddScheduleMatch}>
              <Plus size={16} /> Add Scheduled Match
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Team A</th>
                  <th>Team B</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formState.schedule?.map((match) => (
                  <tr key={match.id}>
                    <td>
                      <input
                        className="admin-input"
                        value={match.stage}
                        onChange={(e) => handleUpdateScheduleMatch(match.id, { stage: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={match.teamA}
                        onChange={(e) => handleUpdateScheduleMatch(match.id, { teamA: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={match.teamB}
                        onChange={(e) => handleUpdateScheduleMatch(match.id, { teamB: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={match.date}
                        onChange={(e) => handleUpdateScheduleMatch(match.id, { date: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={match.time}
                        onChange={(e) => handleUpdateScheduleMatch(match.id, { time: e.target.value })}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => handleDeleteScheduleMatch(match.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!formState.schedule || formState.schedule.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                      No matches scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: Results ── */}
      {activeTab === 'results' && (
        <div className="panel admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Match Results</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleAddResultMatch}>
              <Plus size={16} /> Add Match Result
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Team A</th>
                  <th>Score A</th>
                  <th>Score B</th>
                  <th>Team B</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formState.results?.map((res) => (
                  <tr key={res.id}>
                    <td>
                      <input
                        className="admin-input"
                        value={res.stage}
                        onChange={(e) => handleUpdateResultMatch(res.id, { stage: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={res.teamA}
                        onChange={(e) => handleUpdateResultMatch(res.id, { teamA: e.target.value })}
                      />
                    </td>
                    <td style={{ width: '80px' }}>
                      <input
                        className="admin-input"
                        type="number"
                        value={res.scoreA}
                        onChange={(e) => handleUpdateResultMatch(res.id, { scoreA: parseInt(e.target.value) || 0 })}
                      />
                    </td>
                    <td style={{ width: '80px' }}>
                      <input
                        className="admin-input"
                        type="number"
                        value={res.scoreB}
                        onChange={(e) => handleUpdateResultMatch(res.id, { scoreB: parseInt(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={res.teamB}
                        onChange={(e) => handleUpdateResultMatch(res.id, { teamB: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        value={res.date}
                        onChange={(e) => handleUpdateResultMatch(res.id, { date: e.target.value })}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => handleDeleteResultMatch(res.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!formState.results || formState.results.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                      No match results recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: Standings ── */}
      {activeTab === 'standings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="admin-panel-section__header">
            <h2>Group Standings</h2>
            <button className="admin-btn admin-btn-primary" onClick={handleAddStandingGroup}>
              <Plus size={16} /> Add Standing Group
            </button>
          </div>

          {formState.standings?.map((group, groupIdx) => (
            <div key={groupIdx} className="panel admin-panel-section">
              <div className="admin-panel-section__header">
                <h3>{group.group}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="admin-btn admin-btn-secondary" onClick={() => handleAddRowToGroup(groupIdx)}>
                    <Plus size={14} /> Add Team Row
                  </button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDeleteGroup(groupIdx)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Maps Won</th>
                      <th>Maps Lost</th>
                      <th>Points</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td>
                          <input
                            className="admin-input"
                            value={row.team}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { team: e.target.value })}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={row.wins}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { wins: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={row.losses}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { losses: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={row.mapsWon}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { mapsWon: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={row.mapsLost}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { mapsLost: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={row.points}
                            onChange={(e) => handleUpdateStandingRow(groupIdx, rowIdx, { points: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => handleDeleteStandingRow(groupIdx, rowIdx)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {(!formState.standings || formState.standings.length === 0) && (
            <div className="panel admin-panel-section text-center">
              <p className="text-secondary">No standings groups added yet.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminTournamentEdit;
