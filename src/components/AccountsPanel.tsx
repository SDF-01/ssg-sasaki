import { useEffect, useState } from 'react';

import { fetchAccounts } from '../api';
import { useLanguage } from '../LanguageProvider';
import { PageBanner, PageFrame, PageMetaChip, PageSpread } from './PageChrome';
import type { ArtistId, CustomArtistProfile, SocialAccount } from '../types';

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
  profile?: CustomArtistProfile;
}

export function AccountsPanel({ artist, profile }: AccountsPanelProps) {
  const { tr } = useLanguage();
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
        const data = await fetchAccounts(artist, profile);
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
  }, [artist, profile]);

  if (loading) return <div className="panel-loading">{tr('accounts.loading')}</div>;
  if (error) return <div className="panel-error">{error}</div>;

  return (
    <PageSpread variant="accounts">
      <PageBanner
        sticker="♡"
        title={tr('page.accounts.title')}
        subtitle={tr('page.accounts.subtitle')}
        meta={<PageMetaChip>{tr('page.accounts.linkCount', { count: accounts.length })}</PageMetaChip>}
      />

      <div className="profile-spotlight">
        <span className="profile-spotlight__tape" aria-hidden="true" />
        <div className="profile-spotlight__avatar" aria-hidden="true">
          {artistName.charAt(0)}
        </div>
        <div className="profile-spotlight__copy">
          <h3>{artistName}</h3>
          {tagline ? <p className="profile-spotlight__tagline">{tagline}</p> : null}
          <p className="profile-spotlight__intro">
            {tr('accounts.intro', { name: artistName })}
          </p>
        </div>
        <div className="profile-spotlight__badge">
          <span className="profile-spotlight__badge-label">{tr('page.accounts.fanClub')}</span>
          <strong>{fanName}</strong>
        </div>
      </div>

      <PageFrame
        label={tr('page.accounts.links')}
        labelIcon="🔗"
        variant="sticker"
        className="page-frame--links"
      >
        <div className="accounts-grid">
          {accounts.map((account) => (
            <a
              key={`${artist}-${account.platform}`}
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`account-card account-card--${account.icon}`}
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
          {tr('accounts.builtFor')} <strong>{fanName}</strong>
        </p>
      </PageFrame>
    </PageSpread>
  );
}
