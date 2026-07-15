import type { ArtistId } from './types';

const API_BASES = [
  import.meta.env.VITE_API_BASE as string | undefined,
  '/api',
  'http://127.0.0.1:3001/api',
].filter((base): base is string => Boolean(base));

function isNetworkError(err: unknown): boolean {
  return (
    err instanceof TypeError ||
    (err instanceof Error &&
      (/failed to fetch/i.test(err.message) ||
        /network/i.test(err.message) ||
        /load failed/i.test(err.message)))
  );
}

async function fetchJson<T>(path: string): Promise<T> {
  let lastError: Error | undefined;

  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      if (isNetworkError(err)) continue;
      throw error;
    }
  }

  throw (
    lastError ??
    new Error(
      'Cannot reach the API server. Start it with npm run dev or npm start, then open http://localhost:3001',
    )
  );
}

function artistQuery(artist: ArtistId) {
  return `artist=${artist}`;
}

export function fetchArtists() {
  return fetchJson<{ artists: import('./types').ArtistSummary[] }>('/artists');
}

export function fetchAccounts(artist: ArtistId) {
  return fetchJson<{
    artist: { id: ArtistId; name: string; tagline: string; fanName: string };
    accounts: import('./types').SocialAccount[];
  }>(`/accounts?${artistQuery(artist)}`);
}

export function fetchYouTubeFeeds(artist: ArtistId) {
  return fetchJson<{ artistId: ArtistId; feeds: import('./types').YouTubeFeed[] }>(
    `/youtube/feeds?${artistQuery(artist)}`,
  );
}

export function fetchYouTubeVideos(options: {
  artist: ArtistId;
  feed?: import('./types').YouTubeFeedId;
  pageToken?: string;
}) {
  const params = new URLSearchParams({ artist: options.artist });
  if (options.feed) params.set('feed', options.feed);
  if (options.pageToken) params.set('pageToken', options.pageToken);
  return fetchJson<{
    videos: import('./types').YouTubeVideo[];
    nextPageToken?: string;
    source: 'api' | 'rss' | 'browse';
    feed: import('./types').YouTubeFeedId;
    artistId: ArtistId;
    totalHint?: string;
  }>(`/youtube/videos?${params.toString()}`);
}

export function fetchSpotifyCatalog(artist: ArtistId) {
  return fetchJson<{
    albums: import('./types').SpotifyAlbum[];
    topTracks: import('./types').SpotifyTrack[];
    source: 'api' | 'embed';
    artistId: ArtistId;
  }>(`/spotify/catalog?${artistQuery(artist)}`);
}

export function fetchAlbumTracks(albumId: string) {
  return fetchJson<{ tracks: import('./types').SpotifyTrack[] }>(
    `/spotify/albums/${albumId}/tracks`,
  );
}
