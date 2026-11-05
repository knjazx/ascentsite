import React from 'react';

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match bold **text**, links [text](url), or inline images ![alt](url)
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    // Image ![alt](url)
    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(
        <img
          key={`${keyPrefix}-img-${i}`}
          src={match[2]}
          alt={match[1] || 'article image'}
          className="news-article__inline-img"
          loading="lazy"
        />
      );
    }
    // Bold **text**
    else if (match[3] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{match[3]}</strong>);
    }
    // Link [text](url)
    else if (match[4] !== undefined && match[5] !== undefined) {
      nodes.push(
        <a key={`${keyPrefix}-l-${i}`} href={match[5]} target="_blank" rel="noopener noreferrer" className="news-article__link">
          {match[4]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
    i += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Splits on blank lines into blocks; a block starting with #/##/### becomes a heading, ![alt](url) becomes a figure image, everything else a paragraph. */
export function renderMarkdownLite(body: string): React.ReactNode[] {
  if (!body) return [];
  const blocks = body.trim().split(/\n\s*\n/);

  return blocks.map((block, i) => {
    const trimmed = block.trim();

    // Check for block image ![alt](url)
    const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      return (
        <figure key={i} className="news-article__figure">
          <img src={src} alt={alt || 'Article visual'} className="news-article__img" loading="lazy" />
          {alt && <figcaption className="news-article__figcaption">{alt}</figcaption>}
        </figure>
      );
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={i} className="news-article__h4">
          {renderInline(trimmed.slice(4), `h4-${i}`)}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={i} className="news-article__h3">
          {renderInline(trimmed.slice(3), `h3-${i}`)}
        </h3>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={i} className="news-article__h2">
          {renderInline(trimmed.slice(2), `h2-${i}`)}
        </h2>
      );
    }
    return (
      <p key={i} className="news-article__paragraph">
        {renderInline(trimmed, `p-${i}`)}
      </p>
    );
  });
}
