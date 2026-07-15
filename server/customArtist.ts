import type { Artist, CustomArtistInput, YouTubeFeed, YouTubeFeedId } from './artists.js';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function normalizeHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function handleUrl(handle: string): string {
  const clean = handle.replace(/^@/, '');
  return `https://www.youtube.com/@${clean}`;
}

function buildFeed(
  id: YouTubeFeedId,
  handle: string,
  description: string,
): YouTubeFeed | null {
  const normalized = normalizeHandle(handle);
  if (!normalized) return null;

  const label = normalized.replace('@', '');
  return {
    id,
    label,
    handle: normalized,
    channelId: '',
    url: handleUrl(normalized),
    description,
  };
}

export function createCustomArtistId(name: string): string {
  return `custom-${slugify(name) || 'artist'}`;
}

export function buildCustomArtist(input: CustomArtistInput): Artist {
  const id = input.id || createCustomArtistId(input.name);
  const fanName = input.fanName?.trim() || `${input.name} fans`;

  const vevoFeed = input.youtubeVevoHandle
    ? buildFeed('vevo', input.youtubeVevoHandle, 'Music videos — VEVO / video catalog')
    : null;
  const officialFeed = input.youtubeOfficialHandle
    ? buildFeed('official', input.youtubeOfficialHandle, 'Official channel — exclusives & live')
    : null;

  const youtubeFeeds: Partial<Record<YouTubeFeedId, YouTubeFeed>> = {};
  if (vevoFeed) youtubeFeeds.vevo = vevoFeed;
  if (officialFeed) youtubeFeeds.official = officialFeed;

  if (!vevoFeed && !officialFeed && input.youtubeVevoHandle) {
    const fallback = buildFeed('vevo', input.youtubeVevoHandle, 'YouTube video catalog');
    if (fallback) youtubeFeeds.vevo = fallback;
  }

  const socialAccounts: Artist['socialAccounts'] = [];

  if (input.spotifyArtistId || input.spotifyUrl) {
    socialAccounts.push({
      platform: 'Spotify',
      handle: input.name,
      url:
        input.spotifyUrl ??
        `https://open.spotify.com/artist/${input.spotifyArtistId}`,
      description: 'Stream on Spotify',
      icon: 'spotify',
    });
  }

  if (vevoFeed) {
    socialAccounts.push({
      platform: 'YouTube VEVO',
      handle: vevoFeed.handle,
      url: vevoFeed.url,
      description: 'Music video catalog',
      icon: 'youtube',
    });
  }

  if (officialFeed) {
    socialAccounts.push({
      platform: 'YouTube',
      handle: officialFeed.handle,
      url: officialFeed.url,
      description: 'Official YouTube channel',
      icon: 'youtube',
    });
  }

  if (input.instagramUrl) {
    socialAccounts.push({
      platform: 'Instagram',
      handle: input.instagramUrl.split('/').filter(Boolean).pop() ?? input.name,
      url: input.instagramUrl,
      description: 'Photos and reels',
      icon: 'instagram',
    });
  }

  if (input.tiktokUrl) {
    socialAccounts.push({
      platform: 'TikTok',
      handle: input.tiktokUrl.split('/').filter(Boolean).pop() ?? input.name,
      url: input.tiktokUrl,
      description: 'Short clips',
      icon: 'tiktok',
    });
  }

  if (input.websiteUrl) {
    socialAccounts.push({
      platform: 'Website',
      handle: input.websiteUrl.replace(/^https?:\/\//, ''),
      url: input.websiteUrl,
      description: 'Official site',
      icon: 'web',
    });
  }

  return {
    id,
    name: input.name.trim(),
    nameJp: input.nameJp?.trim() || input.name.trim(),
    tagline: input.tagline?.trim() || 'Hibiki picked this',
    fanName,
    fanNameJp: input.fanNameJp?.trim() || fanName,
    spotifyArtistId: input.spotifyArtistId?.trim() ?? '',
    youtubeFeeds: youtubeFeeds as Record<YouTubeFeedId, YouTubeFeed>,
    socialAccounts,
    custom: true,
  };
}
