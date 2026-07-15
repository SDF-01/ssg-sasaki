import type { ArtistId, CustomArtistProfile } from './types';
import { isCustomArtistId } from './types';

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

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let lastError: Error | undefined;

  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, init);
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

interface ArtistRequest {
  artist: ArtistId;
  profile?: CustomArtistProfile;
}

function artistRequest(path: string, { artist, profile }: ArtistRequest, extra?: object) {
  if (isCustomArtistId(artist) && profile) {
    return requestJson(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, profile, ...extra }),
    });
  }
  const params = new URLSearchParams({ artist });
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null) params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return requestJson(`${path}${qs ? `?${qs}` : ''}`);
}

export function fetchArtists() {
  return requestJson<{ artists: import('./types').ArtistSummary[] }>('/artists');
}

export function fetchAccounts(artist: ArtistId, profile?: CustomArtistProfile) {
  return artistRequest('/accounts', { artist, profile }) as Promise<{
    artist: { id: ArtistId; name: string; tagline: string; fanName: string };
    accounts: import('./types').SocialAccount[];
  }>;
}

export function fetchYouTubeFeeds(artist: ArtistId, profile?: CustomArtistProfile) {
  return artistRequest('/youtube/feeds', { artist, profile }) as Promise<{
    artistId: ArtistId;
    feeds: import('./types').YouTubeFeed[];
  }>;
}

export function fetchYouTubeVideos(options: {
  artist: ArtistId;
  profile?: CustomArtistProfile;
  feed?: import('./types').YouTubeFeedId;
  pageToken?: string;
}) {
  return artistRequest('/youtube/videos', options, {
    feed: options.feed,
    pageToken: options.pageToken,
  }) as Promise<{
    videos: import('./types').YouTubeVideo[];
    nextPageToken?: string;
    source: 'api' | 'rss' | 'browse';
    feed: import('./types').YouTubeFeedId;
    artistId: ArtistId;
    totalHint?: string;
  }>;
}

export function fetchSpotifyCatalog(artist: ArtistId, profile?: CustomArtistProfile) {
  return artistRequest('/spotify/catalog', { artist, profile }) as Promise<{
    albums: import('./types').SpotifyAlbum[];
    topTracks: import('./types').SpotifyTrack[];
    source: 'api' | 'embed';
    artistId: ArtistId;
  }>;
}

export function fetchAlbumTracks(albumId: string) {
  return requestJson<{ tracks: import('./types').SpotifyTrack[] }>(
    `/spotify/albums/${albumId}/tracks`,
  );
}
