import { useState } from 'react';

import { fetchArtistLookup, type ArtistLookupResult } from '../api';
import {
  addCustomArtist,
  createCustomArtistId,
  loadCustomArtists,
  removeCustomArtist,
} from '../customArtists';
import { useLanguage } from '../LanguageProvider';
import { PageBanner, PageFrame, PageSpread } from './PageChrome';
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

function applyLookupToForm(
  prev: typeof EMPTY_FORM,
  result: ArtistLookupResult,
): typeof EMPTY_FORM {
  return {
    ...prev,
    name: result.name || prev.name,
    youtubeVevoHandle: result.youtubeVevoHandle || prev.youtubeVevoHandle,
    youtubeOfficialHandle: result.youtubeOfficialHandle || prev.youtubeOfficialHandle,
    spotifyArtistId: result.spotifyArtistId || prev.spotifyArtistId,
    spotifyUrl: result.spotifyUrl || prev.spotifyUrl,
    fanName: result.fanName || prev.fanName,
  };
}

function hasYoutube(form: typeof EMPTY_FORM): boolean {
  return Boolean(form.youtubeVevoHandle.trim() || form.youtubeOfficialHandle.trim());
}

export function AddArtistPanel({
  customArtists,
  onArtistsChange,
  onSelectArtist,
  onDone,
}: AddArtistPanelProps) {
  const { tr } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [quickQuery, setQuickQuery] = useState('');
  const [error, setError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupPreview, setLookupPreview] = useState<ArtistLookupResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveArtist = (draft: typeof EMPTY_FORM) => {
    const name = draft.name.trim();
    if (!name) {
      setError(tr('add.error.nameRequired'));
      return null;
    }

    if (!hasYoutube(draft)) {
      setError(tr('add.error.youtubeRequired'));
      return null;
    }

    const profile = addCustomArtist({
      name,
      nameJp: draft.nameJp.trim() || undefined,
      tagline: draft.tagline.trim() || undefined,
      fanName: draft.fanName.trim() || undefined,
      youtubeVevoHandle: draft.youtubeVevoHandle.trim() || undefined,
      youtubeOfficialHandle: draft.youtubeOfficialHandle.trim() || undefined,
      spotifyArtistId: draft.spotifyArtistId.trim() || undefined,
      spotifyUrl: draft.spotifyUrl.trim() || undefined,
      instagramUrl: draft.instagramUrl.trim() || undefined,
      tiktokUrl: draft.tiktokUrl.trim() || undefined,
      websiteUrl: draft.websiteUrl.trim() || undefined,
    });

    onArtistsChange(loadCustomArtists());
    setForm(EMPTY_FORM);
    setQuickQuery('');
    setLookupPreview(null);
    setShowAdvanced(false);
    onSelectArtist(profile.id);
    onDone();
    return profile;
  };

  const runLookup = async (query: string): Promise<ArtistLookupResult | null> => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError(tr('add.error.lookupEmpty'));
      return null;
    }

    setLookupLoading(true);
    setError('');

    try {
      const result = await fetchArtistLookup(trimmed);
      setLookupPreview(result);
      setForm((prev) => applyLookupToForm(prev, result));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLookupLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    const result = await runLookup(quickQuery);
    if (!result) return;

    const draft = applyLookupToForm(form, result);
    if (!hasYoutube(draft)) {
      setError(tr('add.error.lookupFailed'));
      setShowAdvanced(true);
      return;
    }

    saveArtist(draft);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    saveArtist(form);
  };

  const handleRemove = (id: string) => {
    removeCustomArtist(id);
    onArtistsChange(loadCustomArtists());
  };

  const youtubePreview =
    lookupPreview?.youtubeVevoHandle ||
    lookupPreview?.youtubeOfficialHandle ||
    tr('add.lookupNone');
  const spotifyPreview = lookupPreview?.spotifyUrl || tr('add.lookupNone');

  return (
    <PageSpread variant="add" className="add-artist-layout">
      <PageBanner
        sticker="✧"
        title={tr('page.add.spreadTitle')}
        subtitle={tr('page.add.spreadSubtitle')}
      />

      <div className="page-columns page-columns--diary">
      <PageFrame
        label={tr('add.title')}
        labelIcon="📝"
        variant="notebook"
        className="page-frame--add-form"
      >
        <p className="add-artist-intro">{tr('add.intro')}</p>

        <div className="add-quick-row">
          <input
            type="text"
            className="add-quick-input"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleQuickAdd();
              }
            }}
            placeholder={tr('add.quickPlaceholder')}
            disabled={lookupLoading}
          />
          <button
            type="button"
            className="load-more add-quick-btn"
            onClick={() => void handleQuickAdd()}
            disabled={lookupLoading}
          >
            {lookupLoading ? tr('add.quickLoading') : tr('add.quickSubmit')}
          </button>
        </div>

        {lookupPreview ? (
          <div className="lookup-preview" aria-live="polite">
            <strong>{tr('add.lookupPreview')}:</strong> {lookupPreview.name}
            <span className="lookup-preview-detail">
              {tr('add.lookupYoutube')}: <code>{youtubePreview}</code>
            </span>
            <span className="lookup-preview-detail">
              {tr('add.lookupSpotify')}:{' '}
              {lookupPreview.spotifyUrl ? (
                <a href={lookupPreview.spotifyUrl} target="_blank" rel="noreferrer">
                  {lookupPreview.spotifyUrl.replace('https://', '')}
                </a>
              ) : (
                <span className="muted">{spotifyPreview}</span>
              )}
            </span>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button
          type="button"
          className="add-advanced-toggle"
          onClick={() => setShowAdvanced((open) => !open)}
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? tr('add.hideAdvanced') : tr('add.customize')}
        </button>

        {showAdvanced ? (
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

            <button type="submit" className="load-more">
              {tr('add.submit')}
            </button>
          </form>
        ) : null}
      </PageFrame>

      {customArtists.length > 0 ? (
        <PageFrame
          label={tr('page.add.collection')}
          labelIcon="💖"
          variant="sticker"
          aside
          className="page-frame--add-list"
        >
          <header className="collection-header">
            <span>{tr('add.listTitle')}</span>
            <span className="collection-count">{customArtists.length}</span>
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
        </PageFrame>
      ) : null}
      </div>
    </PageSpread>
  );
}
