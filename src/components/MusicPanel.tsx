import { useEffect, useRef, useState } from 'react';

import { fetchAlbumTracks, fetchSpotifyCatalog } from '../api';
import type { ArtistId, SpotifyAlbum, SpotifyTrack } from '../types';

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
}

export function MusicPanel({ artist, artistName, spotifyArtistId }: MusicPanelProps) {
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
        const data = await fetchSpotifyCatalog(artist);
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
  }, [artist]);

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

  if (loading) return <div className="panel-loading">Loading discography…</div>;

  return (
    <div className="music-layout">
      <audio ref={audioRef} />

      <section className="spotify-embed-section">
        <h3>Stream {artistName} on Spotify</h3>
        <iframe
          title={`${artistName} on Spotify`}
          src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </section>

      {error && <div className="panel-error">{error}</div>}

      {source === 'api' ? (
        <>
          <section className="track-section">
            <header className="list-header">
              <h3>Top Tracks</h3>
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
            {activeTrack && (
              <p className="now-playing-track">
                Now playing preview: <strong>{activeTrack.name}</strong>
                {!activeTrack.previewUrl && (
                  <span className="muted"> — no 30s preview; open in Spotify</span>
                )}
              </p>
            )}
          </section>

          <section className="album-section">
            <header className="list-header">
              <h3>Albums & Singles</h3>
              <span>{albums.length} releases</span>
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
                    {album.releaseDate} · {album.totalTracks} tracks
                  </span>
                </button>
              ))}
            </div>

            {selectedAlbum && albumTracks.length > 0 && (
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
            )}
          </section>
        </>
      ) : (
        <div className="api-hint card">
          <h3>Unlock full discography browsing</h3>
          <p>
            Add <code>SPOTIFY_CLIENT_ID</code> and <code>SPOTIFY_CLIENT_SECRET</code> to your{' '}
            <code>.env</code> file to browse every album, single, and 30-second previews in-app.
            The Spotify embed above still streams everything right now.
          </p>
        </div>
      )}
    </div>
  );
}
