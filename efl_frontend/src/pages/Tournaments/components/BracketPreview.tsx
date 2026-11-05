import React from 'react';
import { Trophy } from 'lucide-react';

interface BracketPreviewProps {
  /** Group names, e.g. ["Group A", "Group B", ...]. Admin-editable list — the whole
   *  bracket (columns, round labels, connector lines) is derived from its length. */
  groups: string[];
}

function nextPowerOfTwo(n: number): number {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

function getRoundLabel(matchesAtThisRound: number): string {
  if (matchesAtThisRound === 1) return 'Grand Final';
  if (matchesAtThisRound === 2) return 'Semifinals';
  if (matchesAtThisRound === 4) return 'Quarterfinals';
  return `Round of ${matchesAtThisRound * 2}`;
}

const HEADER_ROW = 1; // row 1 is reserved for the column labels; bracket content starts at row 2

const BracketPreview: React.FC<BracketPreviewProps> = ({ groups }) => {
  const leafCount = Math.max(2, nextPowerOfTwo(groups.length));
  // Pad with TBD slots if the group count isn't a power of two yet (byes).
  const seeds = Array.from({ length: leafCount }, (_, i) => groups[i] ?? 'TBD');
  const roundsCount = Math.log2(leafCount);
  const totalColumns = 1 + roundsCount * 2; // seed column, then (connector, box) per round

  const columnTemplate = Array.from({ length: totalColumns }, (_, i) =>
    i === 0 || i % 2 === 0 ? 'minmax(130px, 1fr)' : '28px',
  ).join(' ');

  const headerLabels: { label: string; column: number }[] = [{ label: 'Group Stage', column: 1 }];
  for (let level = 1; level <= roundsCount; level += 1) {
    headerLabels.push({ label: getRoundLabel(leafCount / 2 ** level), column: 1 + level * 2 });
  }

  const items: React.ReactNode[] = seeds.map((seed, i) => (
    <div
      key={`seed-${i}`}
      className="bracket-box bracket-box--seed"
      style={{ gridColumn: 1, gridRow: `${i + 1 + HEADER_ROW} / span 1` }}
    >
      {seed}
    </div>
  ));

  for (let level = 1; level <= roundsCount; level += 1) {
    const matchCount = leafCount / 2 ** level;
    const span = leafCount / matchCount;
    const boxCol = 1 + level * 2;
    const connCol = boxCol - 1;
    const isFinal = level === roundsCount;

    for (let j = 0; j < matchCount; j += 1) {
      const rowStart = j * span + 1 + HEADER_ROW;
      items.push(
        <div
          key={`conn-${level}-${j}`}
          className="bracket-connector"
          style={{ gridColumn: connCol, gridRow: `${rowStart} / span ${span}` }}
          aria-hidden="true"
        >
          <div className="bracket-connector__merge" />
        </div>,
      );
      items.push(
        <div
          key={`box-${level}-${j}`}
          className={`bracket-box${isFinal ? ' bracket-box--final' : ' bracket-box--match'}`}
          style={{ gridColumn: boxCol, gridRow: `${rowStart} / span ${span}` }}
        >
          {isFinal ? <Trophy size={20} /> : '– –'}
        </div>,
      );
    }
  }

  return (
    <div className="bracket-preview">
      <div
        className="bracket-grid"
        style={{
          gridTemplateColumns: columnTemplate,
          gridTemplateRows: `auto repeat(${leafCount}, minmax(2.25rem, auto))`,
        }}
      >
        {headerLabels.map(({ label, column }) => (
          <span
            key={label}
            className="bracket-header-label text-tertiary"
            style={{ gridColumn: column, gridRow: '1 / span 1' }}
          >
            {label}
          </span>
        ))}
        {items}
      </div>
    </div>
  );
};

export default BracketPreview;
