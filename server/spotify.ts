import { type Artist, type ArtistId } from './artists.js';

export interface SpotifyTrack {
  id: string;
  name: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  durationMs: number;
  spotifyUrl: string;
  trackNumber: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  releaseDate: string;
  totalTracks: number;
  image: string;
  spotifyUrl: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };
  return cachedToken.token;
}

async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API error: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getSpotifyCatalog(options: {
  artist: Artist;
  clientId?: string;
  clientSecret?: string;
}): Promise<{
  albums: SpotifyAlbum[];
  topTracks: SpotifyTrack[];
  source: 'api' | 'embed';
  artistId: ArtistId;
}> {
  const { clientId, clientSecret, artist } = options;
  const artistId = artist.id;

  if (!clientId || !clientSecret || !artist.spotifyArtistId) {
    return { albums: [], topTracks: [], source: 'embed', artistId };
  }

  const token = await getAccessToken(clientId, clientSecret);
  const artistSpotifyId = artist.spotifyArtistId;

  const [albumsData, topTracksData] = await Promise.all([
    spotifyGet<{
      items: Array<{
        id: string;
        name: string;
        release_date: string;
        total_tracks: number;
        images: Array<{ url: string }>;
        external_urls: { spotify: string };
      }>;
    }>(`/artists/${artistSpotifyId}/albums?include_groups=album,single&limit=50`, token),
    spotifyGet<{
      tracks: Array<{
        id: string;
        name: string;
        album: { name: string; images: Array<{ url: string }> };
        preview_url: string | null;
        duration_ms: number;
        external_urls: { spotify: string };
        track_number: number;
      }>;
    }>(`/artists/${artistSpotifyId}/top-tracks?market=US`, token),
  ]);

  const albums: SpotifyAlbum[] = albumsData.items.map((a) => ({
    id: a.id,
    name: a.name,
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
    image: a.images[0]?.url ?? '',
    spotifyUrl: a.external_urls.spotify,
  }));

  const topTracks: SpotifyTrack[] = topTracksData.tracks.map((t) => ({
    id: t.id,
    name: t.name,
    album: t.album.name,
    albumArt: t.album.images[0]?.url ?? '',
    previewUrl: t.preview_url,
    durationMs: t.duration_ms,
    spotifyUrl: t.external_urls.spotify,
    trackNumber: t.track_number,
  }));

  return { albums, topTracks, source: 'api', artistId };
}

export async function getAlbumTracks(
  albumId: string,
  clientId: string,
  clientSecret: string,
): Promise<SpotifyTrack[]> {
  const token = await getAccessToken(clientId, clientSecret);
  const data = await spotifyGet<{
    items: Array<{
      id: string;
      name: string;
      album: { name: string; images: Array<{ url: string }> };
      preview_url: string | null;
      duration_ms: number;
      external_urls: { spotify: string };
      track_number: number;
    }>;
  }>(`/albums/${albumId}/tracks?limit=50`, token);

  return data.items.map((t) => ({
    id: t.id,
    name: t.name,
    album: t.album.name,
    albumArt: t.album.images[0]?.url ?? '',
    previewUrl: t.preview_url,
    durationMs: t.duration_ms,
    spotifyUrl: t.external_urls.spotify,
    trackNumber: t.track_number,
  }));
}
