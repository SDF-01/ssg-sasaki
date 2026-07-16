import type { CustomArtistInput } from './artists.js';
import { getSpotifyArtistById, searchSpotifyArtist } from './spotify.js';
import { fetchChannelViaBrowse } from './youtubeBrowse.js';

export type LookupConfidence = 'high' | 'medium' | 'low';

export interface ArtistLookupResult {
  name: string;
  nameJp?: string;
  youtubeVevoHandle?: string;
  youtubeOfficialHandle?: string;
  spotifyArtistId?: string;
  spotifyUrl?: string;
  fanName?: string;
  confidence: LookupConfidence;
  sources: string[];
}

const MAX_YOUTUBE_PROBES = 10;

function nameFromHandle(handle: string): string {
  const slug = handle.replace(/^@/, '').replace(/vevo$/i, '');
  if (!slug) return handle;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function normalizeHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function parseInput(raw: string): {
  name?: string;
  youtubeHandles: string[];
  spotifyArtistId?: string;
  spotifyUrl?: string;
} {
  const trimmed = raw.trim();
  const youtubeHandles: string[] = [];
  let spotifyArtistId: string | undefined;
  let spotifyUrl: string | undefined;
  let name: string | undefined;

  const spotifyMatch = trimmed.match(/open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch) {
    spotifyArtistId = spotifyMatch[1];
    spotifyUrl = `https://open.spotify.com/artist/${spotifyArtistId}`;
  }

  const ytHandleMatch = trimmed.match(/youtube\.com\/@([^\/?#&]+)/i);
  if (ytHandleMatch) {
    youtubeHandles.push(normalizeHandle(ytHandleMatch[1]));
  }

  if (/^@[a-zA-Z0-9._-]+$/.test(trimmed)) {
    youtubeHandles.push(normalizeHandle(trimmed));
  }

  const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.includes('open.spotify.com');
  if (!isUrl && !trimmed.startsWith('@')) {
    name = trimmed;
  }

  return {
    name,
    youtubeHandles: [...new Set(youtubeHandles)],
    spotifyArtistId,
    spotifyUrl,
  };
}

function guessHandles(name: string): string[] {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const compact = lower.replace(/[^a-z0-9]/g, '');
  const noSpaces = lower.replace(/\s+/g, '');
  const raw = trimmed.replace(/\s+/g, '');

  const slugs = [...new Set([compact, noSpaces, raw.toLowerCase()].filter(Boolean))];
  const handles: string[] = [];

  for (const slug of slugs) {
    handles.push(
      `@${slug}vevo`,
      `@${slug}`,
      `@${slug}VEVO`,
      `@${slug}_official`,
      `@${slug}official`,
    );
  }

  if (raw && raw !== lower) {
    handles.push(`@${raw}`, `@${raw}_official`, `@${raw}official`);
  }

  return [...new Set(handles)];
}

async function probeYoutubeHandle(handle: string): Promise<boolean> {
  try {
    const normalized = normalizeHandle(handle);
    const result = await fetchChannelViaBrowse(normalized, undefined, 1);
    return result.videos.length > 0;
  } catch {
    return false;
  }
}

async function resolveYoutubeHandles(
  parsedHandles: string[],
  name: string,
): Promise<{ vevo?: string; official?: string; sources: string[] }> {
  const sources: string[] = [];
  const verified: string[] = [];
  const seen = new Set<string>();

  const remember = (handle: string, source: string) => {
    const normalized = normalizeHandle(handle);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) return false;
    seen.add(key);
    verified.push(normalized);
    sources.push(source);
    return true;
  };

  for (const handle of parsedHandles) {
    if (await probeYoutubeHandle(handle)) {
      remember(handle, 'youtube-url');
      if (verified.length >= 2) break;
    }
  }

  if (verified.length < 2 && name) {
    const candidates = guessHandles(name).filter((h) => !seen.has(normalizeHandle(h).toLowerCase()));
    for (const handle of candidates.slice(0, MAX_YOUTUBE_PROBES)) {
      if (await probeYoutubeHandle(handle)) {
        remember(handle, 'youtube-guess');
        if (verified.length >= 2) break;
      }
    }
  }

  const vevo =
    verified.find((h) => /vevo/i.test(h)) ??
    verified[0];
  const official = verified.find((h) => h !== vevo);

  return {
    vevo,
    official,
    sources,
  };
}

function assignHandles(handles: string[]): { vevo?: string; official?: string } {
  const normalized = handles.map(normalizeHandle);
  const vevo = normalized.find((h) => /vevo/i.test(h)) ?? normalized[0];
  const official = normalized.find((h) => h !== vevo);
  return { vevo, official };
}

function computeConfidence(
  youtube: { vevo?: string; official?: string },
  spotify: { id?: string },
): LookupConfidence {
  const hasYoutube = Boolean(youtube.vevo || youtube.official);
  const hasSpotify = Boolean(spotify.id);
  if (hasYoutube && hasSpotify) return 'high';
  if (hasYoutube) return 'medium';
  return 'low';
}

export async function lookupArtist(
  query: string,
  options?: { clientId?: string; clientSecret?: string },
): Promise<ArtistLookupResult> {
  const parsed = parseInput(query);
  const sources: string[] = [];
  let name = parsed.name ?? query.trim();

  if (!parsed.name) {
    if (parsed.youtubeHandles.length > 0) {
      name = nameFromHandle(parsed.youtubeHandles[0]);
    } else if (name.startsWith('@')) {
      name = nameFromHandle(name);
    }
  }

  let spotifyArtistId = parsed.spotifyArtistId;
  let spotifyUrl = parsed.spotifyUrl;

  const { clientId, clientSecret } = options ?? {};

  if (clientId && clientSecret) {
    if (spotifyArtistId) {
      const artist = await getSpotifyArtistById(spotifyArtistId, clientId, clientSecret);
      if (artist) {
        name = artist.name;
        spotifyArtistId = artist.id;
        spotifyUrl = artist.url;
        sources.push('spotify-url');
      }
    } else if (name) {
      const artist = await searchSpotifyArtist(name, clientId, clientSecret);
      if (artist) {
        name = parsed.name ?? artist.name;
        spotifyArtistId = artist.id;
        spotifyUrl = artist.url;
        sources.push('spotify-search');
      }
    }
  } else if (spotifyArtistId) {
    sources.push('spotify-url');
  }

  let youtubeVevoHandle: string | undefined;
  let youtubeOfficialHandle: string | undefined;

  if (parsed.youtubeHandles.length > 0) {
    const youtube = await resolveYoutubeHandles(parsed.youtubeHandles, name);
    youtubeVevoHandle = youtube.vevo;
    youtubeOfficialHandle = youtube.official;
    sources.push(...youtube.sources);
  } else if (name) {
    const youtube = await resolveYoutubeHandles([], name);
    youtubeVevoHandle = youtube.vevo;
    youtubeOfficialHandle = youtube.official;
    sources.push(...youtube.sources);
  } else if (parsed.youtubeHandles.length > 0) {
    const assigned = assignHandles(parsed.youtubeHandles);
    youtubeVevoHandle = assigned.vevo;
    youtubeOfficialHandle = assigned.official;
    sources.push('youtube-url-unverified');
  }

  const confidence = computeConfidence(
    { vevo: youtubeVevoHandle, official: youtubeOfficialHandle },
    { id: spotifyArtistId },
  );

  const profile: Partial<CustomArtistInput> = {
    name,
    youtubeVevoHandle,
    youtubeOfficialHandle,
    spotifyArtistId,
    spotifyUrl,
  };

  return {
    name: profile.name ?? name,
    youtubeVevoHandle: profile.youtubeVevoHandle,
    youtubeOfficialHandle: profile.youtubeOfficialHandle,
    spotifyArtistId: profile.spotifyArtistId,
    spotifyUrl: profile.spotifyUrl,
    fanName: name ? `${name} fans` : undefined,
    confidence,
    sources: [...new Set(sources)],
  };
}
