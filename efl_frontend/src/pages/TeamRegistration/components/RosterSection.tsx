import React from 'react';
import { Plus, X } from 'lucide-react';
import { createEmptyPlayer, MAX_SUBSTITUTES, type RosterPlayer } from '@/types';

interface PlayerRowProps {
  index: number;
  player: RosterPlayer;
  onChange: (player: RosterPlayer) => void;
  onRemove?: () => void;
  errors?: { nickname?: string; steamUrl?: string };
}

const PlayerRow: React.FC<PlayerRowProps> = ({ index, player, onChange, onRemove, errors }) => (
  <div className="roster-player">
    <span className="roster-player__index">{index}</span>

    <div className="form-field roster-player__field">
      <input
        type="text"
        className="input-field"
        placeholder="Nickname"
        value={player.nickname}
        onChange={(e) => onChange({ ...player, nickname: e.target.value })}
      />
      {errors?.nickname && <p className="form-error">{errors.nickname}</p>}
    </div>

    <div className="form-field roster-player__field">
      <input
        type="text"
        className="input-field"
        placeholder="Steam Profile URL"
        value={player.steamUrl}
        onChange={(e) => onChange({ ...player, steamUrl: e.target.value })}
      />
      {errors?.steamUrl && <p className="form-error">{errors.steamUrl}</p>}
    </div>

    {onRemove ? (
      <button
        type="button"
        className="roster-player__remove"
        onClick={onRemove}
        aria-label="Remove player"
      >
        <X size={16} />
      </button>
    ) : (
      <span />
    )}
  </div>
);

interface RosterSectionProps {
  mainRoster: RosterPlayer[];
  substitutes: RosterPlayer[];
  onMainChange: (players: RosterPlayer[]) => void;
  onSubstitutesChange: (players: RosterPlayer[]) => void;
  mainErrors?: Record<number, { nickname?: string; steamUrl?: string }>;
}

const RosterSection: React.FC<RosterSectionProps> = ({
  mainRoster,
  substitutes,
  onMainChange,
  onSubstitutesChange,
  mainErrors,
}) => {
  const updateMainPlayer = (index: number, player: RosterPlayer) => {
    const next = [...mainRoster];
    next[index] = player;
    onMainChange(next);
  };

  const updateSubPlayer = (index: number, player: RosterPlayer) => {
    const next = [...substitutes];
    next[index] = player;
    onSubstitutesChange(next);
  };

  const addSubstitute = () => {
    if (substitutes.length >= MAX_SUBSTITUTES) return;
    onSubstitutesChange([...substitutes, createEmptyPlayer()]);
  };

  const removeSubstitute = (index: number) => {
    onSubstitutesChange(substitutes.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="roster-group">
        <h3 className="roster-group__title">Main Roster</h3>

        {mainRoster.map((player, i) => (
          <PlayerRow
            key={player.id}
            index={i + 1}
            player={player}
            onChange={(p) => updateMainPlayer(i, p)}
            errors={mainErrors?.[i]}
          />
        ))}
      </div>

      <div className="roster-group">
        <h3 className="roster-group__title">
          Substitutes (Optional, up to {MAX_SUBSTITUTES})
        </h3>

        {substitutes.map((player, i) => (
          <PlayerRow
            key={player.id}
            index={i + 1}
            player={player}
            onChange={(p) => updateSubPlayer(i, p)}
            onRemove={() => removeSubstitute(i)}
          />
        ))}

        {substitutes.length < MAX_SUBSTITUTES && (
          <button
            type="button"
            className="btn-outline roster-add-btn"
            onClick={addSubstitute}
          >
            <Plus size={16} />
            Add Substitute
          </button>
        )}
      </div>
    </>
  );
};

export default RosterSection;