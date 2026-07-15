import { useState } from 'react';

import {
  addCustomArtist,
  createCustomArtistId,
  loadCustomArtists,
  removeCustomArtist,
} from '../customArtists';
import { useLanguage } from '../LanguageProvider';
import type { ArtistId, CustomArtistProfile } from '../types';

interface AddArtistPanelProps {
  customArtists: CustomArtistProfile[];
  onArtistsChange: (artists: CustomArtistProfile[]) => void;
  onSelectArtist: (id: ArtistId) => void;
  onDone: () => void;
}

const EMPTY_FORM = {
  name: '',
  nameJp: '',
  tagline: '',
  fanName: '',
  youtubeVevoHandle: '',
  youtubeOfficialHandle: '',
  spotifyArtistId: '',
  spotifyUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  websiteUrl: '',
};

export function AddArtistPanel({
  customArtists,
  onArtistsChange,
  onSelectArtist,
  onDone,
}: AddArtistPanelProps) {
  const { tr } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    if (!name) {
      setError(tr('add.error.nameRequired'));
      return;
    }

    if (!form.youtubeVevoHandle.trim() && !form.youtubeOfficialHandle.trim()) {
      setError(tr('add.error.youtubeRequired'));
      return;
    }

    const profile = addCustomArtist({
      name,
      nameJp: form.nameJp.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      fanName: form.fanName.trim() || undefined,
      youtubeVevoHandle: form.youtubeVevoHandle.trim() || undefined,
      youtubeOfficialHandle: form.youtubeOfficialHandle.trim() || undefined,
      spotifyArtistId: form.spotifyArtistId.trim() || undefined,
      spotifyUrl: form.spotifyUrl.trim() || undefined,
      instagramUrl: form.instagramUrl.trim() || undefined,
      tiktokUrl: form.tiktokUrl.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
    });

    onArtistsChange(loadCustomArtists());
    setForm(EMPTY_FORM);
    onSelectArtist(profile.id);
    onDone();
  };

  const handleRemove = (id: string) => {
    removeCustomArtist(id);
    onArtistsChange(loadCustomArtists());
  };

  return (
    <div className="add-artist-layout">
      <section className="add-artist-form card">
        <h3>{tr('add.title')}</h3>
        <p className="add-artist-intro">{tr('add.intro')}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>{tr('add.name')}</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={tr('add.placeholder.name')}
                required
              />
            </label>

            <label className="form-field">
              <span>{tr('add.nameJp')}</span>
              <input
                type="text"
                value={form.nameJp}
                onChange={(e) => update('nameJp', e.target.value)}
                placeholder={tr('add.placeholder.nameJp')}
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{tr('add.youtubePrimary')}</span>
              <input
                type="text"
                value={form.youtubeVevoHandle}
                onChange={(e) => update('youtubeVevoHandle', e.target.value)}
                placeholder={tr('add.placeholder.youtubePrimary')}
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{tr('add.youtubeSecondary')}</span>
              <input
                type="text"
                value={form.youtubeOfficialHandle}
                onChange={(e) => update('youtubeOfficialHandle', e.target.value)}
                placeholder={tr('add.placeholder.youtubeSecondary')}
              />
            </label>

            <label className="form-field">
              <span>{tr('add.spotifyId')}</span>
              <input
                type="text"
                value={form.spotifyArtistId}
                onChange={(e) => update('spotifyArtistId', e.target.value)}
                placeholder={tr('add.placeholder.spotifyId')}
              />
            </label>

            <label className="form-field">
              <span>{tr('add.spotifyUrl')}</span>
              <input
                type="url"
                value={form.spotifyUrl}
                onChange={(e) => update('spotifyUrl', e.target.value)}
                placeholder={tr('add.placeholder.spotifyUrl')}
              />
            </label>

            <label className="form-field">
              <span>{tr('add.instagram')}</span>
              <input
                type="url"
                value={form.instagramUrl}
                onChange={(e) => update('instagramUrl', e.target.value)}
                placeholder={tr('add.placeholder.instagram')}
              />
            </label>

            <label className="form-field">
              <span>{tr('add.tiktok')}</span>
              <input
                type="url"
                value={form.tiktokUrl}
                onChange={(e) => update('tiktokUrl', e.target.value)}
                placeholder={tr('add.placeholder.tiktok')}
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{tr('add.tagline')}</span>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                placeholder={tr('add.placeholder.tagline')}
              />
            </label>

            <label className="form-field">
              <span>{tr('add.fanName')}</span>
              <input
                type="text"
                value={form.fanName}
                onChange={(e) => update('fanName', e.target.value)}
                placeholder={tr('add.placeholder.fanName')}
              />
            </label>
          </div>

          {form.name.trim() ? (
            <p className="form-preview-id muted">
              {tr('add.pageId')} <code>{createCustomArtistId(form.name)}</code>
            </p>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="load-more">
            {tr('add.submit')}
          </button>
        </form>
      </section>

      {customArtists.length > 0 && (
        <section className="custom-artist-list">
          <header className="list-header">
            <h3>{tr('add.listTitle')}</h3>
            <span>{customArtists.length}</span>
          </header>
          <ul className="custom-artist-items">
            {customArtists.map((artist) => (
              <li key={artist.id} className="custom-artist-row">
                <div>
                  <strong>{artist.name}</strong>
                  <span className="muted">{artist.youtubeVevoHandle || artist.youtubeOfficialHandle}</span>
                </div>
                <div className="custom-artist-actions">
                  <button type="button" className="feed-btn" onClick={() => onSelectArtist(artist.id)}>
                    {tr('add.openPage')}
                  </button>
                  <button
                    type="button"
                    className="video-search-clear"
                    aria-label={tr('add.removeAria', { name: artist.name })}
                    onClick={() => handleRemove(artist.id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
