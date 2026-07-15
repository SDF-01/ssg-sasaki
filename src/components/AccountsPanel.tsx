import { useEffect, useState } from 'react';

import { fetchAccounts } from '../api';
import type { ArtistId, SocialAccount } from '../types';

const ICON_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple: 'Apple Music',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
  facebook: 'Facebook',
  deezer: 'Deezer',
  soundcloud: 'SoundCloud',
  tidal: 'Tidal',
  amazon: 'Amazon Music',
  web: 'Website',
};

interface AccountsPanelProps {
  artist: ArtistId;
}

export function AccountsPanel({ artist }: AccountsPanelProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [artistName, setArtistName] = useState('');
  const [fanName, setFanName] = useState('');
  const [tagline, setTagline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    void (async () => {
      try {
        const data = await fetchAccounts(artist);
        setAccounts(data.accounts);
        setArtistName(data.artist.name);
        setFanName(data.artist.fanName);
        setTagline(data.artist.tagline);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    })();
  }, [artist]);

  if (loading) return <div className="panel-loading">Loading official accounts…</div>;
  if (error) return <div className="panel-error">{error}</div>;

  return (
    <div className="accounts-layout">
      <p className="accounts-intro">
        Every verified {artistName} profile in one place — streaming, social, and official site.
        {tagline ? ` ${tagline}.` : ''}
      </p>
      <div className="accounts-grid">
        {accounts.map((account) => (
          <a
            key={`${artist}-${account.platform}`}
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="account-card"
          >
            <div className={`account-icon icon-${account.icon}`} aria-hidden="true">
              {(ICON_LABELS[account.icon] ?? account.platform).charAt(0)}
            </div>
            <div>
              <strong>{account.platform}</strong>
              <span className="handle">{account.handle}</span>
              <p>{account.description}</p>
            </div>
            <span className="external" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </div>
      <p className="accounts-fan-note">
        Built for <strong>{fanName}</strong>
      </p>
    </div>
  );
}
