import { getThemeClass } from '../artists';
import { useLanguage } from '../LanguageProvider';
import type { ArtistId, ArtistSummary } from '../types';

interface ArtistSwitcherProps {
  artists: ArtistSummary[];
  active: ArtistId;
  onChange: (artist: ArtistId) => void;
}

export function ArtistSwitcher({ artists, active, onChange }: ArtistSwitcherProps) {
  const { locale, tr } = useLanguage();

  return (
    <nav className="artist-switcher" aria-label={tr('artist.switcherAria')}>
      {artists.map((artist) => {
        const primaryName = locale === 'ja' ? artist.nameJp || artist.name : artist.name;
        const secondaryName = locale === 'ja' ? artist.name : artist.nameJp;

        return (
          <button
            key={artist.id}
            type="button"
            className={`artist-btn ${getThemeClass(artist.id)} ${active === artist.id ? 'active' : ''}`}
            aria-pressed={active === artist.id}
            onClick={() => onChange(artist.id)}
          >
            <span className="artist-btn-name">{primaryName}</span>
            {secondaryName && secondaryName !== primaryName ? (
              <span className="artist-btn-jp">{secondaryName}</span>
            ) : null}
            {artist.custom ? <span className="artist-btn-tag">{tr('artist.custom')}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
