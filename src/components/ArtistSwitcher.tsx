import type { ArtistId, ArtistSummary } from '../types';

interface ArtistSwitcherProps {
  artists: ArtistSummary[];
  active: ArtistId;
  onChange: (artist: ArtistId) => void;
}

export function ArtistSwitcher({ artists, active, onChange }: ArtistSwitcherProps) {
  return (
    <nav className="artist-switcher" aria-label="Choose artist">
      {artists.map((artist) => (
        <button
          key={artist.id}
          type="button"
          className={`artist-btn artist-btn--${artist.id} ${active === artist.id ? 'active' : ''}`}
          aria-pressed={active === artist.id}
          onClick={() => onChange(artist.id)}
        >
          <span className="artist-btn-name">{artist.name}</span>
          <span className="artist-btn-jp">{artist.nameJp}</span>
        </button>
      ))}
    </nav>
  );
}
