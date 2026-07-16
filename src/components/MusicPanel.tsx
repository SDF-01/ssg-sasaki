import { useEffect, useRef, useState } from 'react';

import { fetchAlbumTracks, fetchSpotifyCatalog } from '../api';
import { useLanguage } from '../LanguageProvider';
import { PageBanner, PageFrame, PageMetaChip, PageSpread } from './PageChrome';
import type { ArtistId, CustomArtistProfile, SpotifyAlbum, SpotifyTrack } from '../types';

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MusicPanelProps {
  artist: ArtistId;
  artistName: string;
  spotifyArtistId: string;
  profile?: CustomArtistProfile;
}

export function MusicPanel({ artist, artistName, spotifyArtistId, profile }: MusicPanelProps) {
  const { tr } = useLanguage();
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);
  const [source, setSource] = useState<'api' | 'embed'>('embed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelectedAlbum(null);
    setAlbumTracks([]);
    void (async () => {
      try {
        const data = await fetchSpotifyCatalog(artist, profile);
        setAlbums(data.albums);
        setTopTracks(data.topTracks);
        setSource(data.source);
        setActiveTrack(data.topTracks[0] ?? null);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load music');
      } finally {
        setLoading(false);
      }
    })();
  }, [artist, profile]);

  useEffect(() => {
    if (!selectedAlbum || source !== 'api') return;
    void (async () => {
      try {
        const data = await fetchAlbumTracks(selectedAlbum.id);
        setAlbumTracks(data.tracks);
      } catch {
        setAlbumTracks([]);
      }
    })();
  }, [selectedAlbum, source]);

  useEffect(() => {
    if (!audioRef.current || !activeTrack?.previewUrl) return;
    audioRef.current.src = activeTrack.previewUrl;
    void audioRef.current.play().catch(() => undefined);
  }, [activeTrack]);

  if (loading) return <div className="panel-loading">{tr('music.loading')}</div>;

  return (
    <PageSpread variant="music">
      <audio ref={audioRef} />

      <PageBanner
        sticker="♫"
        title={tr('page.music.title')}
        subtitle={tr('page.music.subtitle')}
        meta={
          <>
            <PageMetaChip>{artistName}</PageMetaChip>
            {source === 'api' ? (
              <PageMetaChip>{tr('music.releases', { count: albums.length })}</PageMetaChip>
            ) : (
              <PageMetaChip>Spotify</PageMetaChip>
            )}
          </>
        }
      />

      {error ? <div className="panel-error">{error}</div> : null}

      <div className="page-columns page-columns--music">
        <PageFrame
          label={tr('page.music.player')}
          labelIcon="💿"
          variant="cassette"
          className="page-frame--player"
        >
          <p className="frame-lead">{tr('music.streamOn', { name: artistName })}</p>
          {spotifyArtistId ? (
            <div className="cassette-shell">
              <span className="cassette-shell__reel cassette-shell__reel--l" aria-hidden="true" />
              <span className="cassette-shell__reel cassette-shell__reel--r" aria-hidden="true" />
              <iframe
                title={`${artistName} on Spotify`}
                src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          ) : (
            <p className="muted frame-empty">{tr('music.noSpotify')}</p>
          )}
        </PageFrame>

        {source === 'api' ? (
          <PageFrame
            label={tr('page.music.discography')}
            labelIcon="📀"
            variant="notebook"
            aside
            className="page-frame--tracks"
          >
            <section className="track-section track-section--embedded">
              <header className="section-mini-header">
                <h4>{tr('music.topTracks')}</h4>
              </header>
              <ul className="track-list">
                {topTracks.map((track, i) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      className={`track-item ${activeTrack?.id === track.id ? 'selected' : ''}`}
                      onClick={() => setActiveTrack(track)}
                    >
                      <span className="track-num">{i + 1}</span>
                      <img src={track.albumArt} alt="" />
                      <div>
                        <strong>{track.name}</strong>
                        <span>{track.album}</span>
                      </div>
                      <span className="duration">{formatDuration(track.durationMs)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {activeTrack ? (
                <p className="now-playing-track">
                  {tr('music.nowPlaying')} <strong>{activeTrack.name}</strong>
                  {!activeTrack.previewUrl ? (
                    <span className="muted">{tr('music.noPreview')}</span>
                  ) : null}
                </p>
              ) : null}
            </section>

            <section className="album-section album-section--embedded">
              <header className="section-mini-header">
                <h4>{tr('music.albums')}</h4>
                <span>{tr('music.releases', { count: albums.length })}</span>
              </header>
              <div className="album-grid">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    className={`album-card ${selectedAlbum?.id === album.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <img src={album.image} alt={album.name} loading="lazy" />
                    <strong>{album.name}</strong>
                    <span>
                      {album.releaseDate} · {tr('music.tracks', { count: album.totalTracks })}
                    </span>
                  </button>
                ))}
              </div>

              {selectedAlbum && albumTracks.length > 0 ? (
                <ul className="track-list album-tracks">
                  {albumTracks.map((track, i) => (
                    <li key={track.id}>
                      <button
                        type="button"
                        className={`track-item ${activeTrack?.id === track.id ? 'selected' : ''}`}
                        onClick={() => setActiveTrack(track)}
                      >
                        <span className="track-num">{track.trackNumber || i + 1}</span>
                        <div>
                          <strong>{track.name}</strong>
                        </div>
                        <span className="duration">{formatDuration(track.durationMs)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </PageFrame>
        ) : (
          <PageFrame
            label={tr('page.music.discography')}
            labelIcon="📀"
            variant="notebook"
            aside
            className="page-frame--tracks"
          >
            <div className="api-hint api-hint--inline">
              <h4>{tr('music.unlockTitle')}</h4>
              <p>{tr('music.unlockBody')}</p>
            </div>
          </PageFrame>
        )}
      </div>
    </PageSpread>
  );
}
