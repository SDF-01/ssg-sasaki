import { XMLParser } from 'fast-xml-parser';

import { type ArtistId, getArtist, type YouTubeFeedId } from './artists.js';
import { fetchChannelViaBrowse } from './youtubeBrowse.js';

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  viewCount?: number;
  duration?: string;
}

function uploadsPlaylistId(channelId: string): string {
  return `UU${channelId.slice(2)}`;
}

async function fetchViaRss(channelId: string): Promise<YouTubeVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PopHub/1.0)',
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
    },
  });
  if (!res.ok) throw new Error(`YouTube RSS failed: ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml) as {
    feed?: {
      entry?: Array<Record<string, unknown>> | Record<string, unknown>;
    };
  };

  const entries = parsed.feed?.entry;
  if (!entries) return [];

  const list = Array.isArray(entries) ? entries : [entries];

  return list.map((entry) => {
    const media = entry['media:group'] as Record<string, unknown> | undefined;
    const thumb = media?.['media:thumbnail'] as { '@_url'?: string } | undefined;
    const description = (media?.['media:description'] as string | undefined) ?? '';

    return {
      id: String(entry['yt:videoId'] ?? ''),
      title: String(entry.title ?? 'Untitled'),
      publishedAt: String(entry.published ?? ''),
      thumbnail: thumb?.['@_url'] ?? `https://i.ytimg.com/vi/${entry['yt:videoId']}/hqdefault.jpg`,
      description,
    };
  });
}

async function fetchViaApi(
  apiKey: string,
  channelId: string,
  pageToken?: string,
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const playlistId = uploadsPlaylistId(channelId);
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '50',
    key: apiKey,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        resourceId: { videoId: string };
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
      contentDetails?: { videoId: string };
    }>;
    nextPageToken?: string;
  };

  const videos: YouTubeVideo[] = (data.items ?? []).map((item) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`,
    description: item.snippet.description,
  }));

  return { videos, nextPageToken: data.nextPageToken };
}

export async function getYouTubeVideos(options: {
  artistId: ArtistId;
  feed?: YouTubeFeedId;
  apiKey?: string;
  pageToken?: string;
  limit?: number;
}): Promise<{
  videos: YouTubeVideo[];
  nextPageToken?: string;
  source: 'api' | 'rss' | 'browse';
  feed: YouTubeFeedId;
  artistId: ArtistId;
  totalHint?: string;
}> {
  const { apiKey, pageToken, limit = 50, artistId } = options;
  const feed = options.feed ?? 'vevo';
  const feedConfig = getArtist(artistId).youtubeFeeds[feed];
  const channelId = feedConfig.channelId;

  if (apiKey) {
    try {
      const result = await fetchViaApi(apiKey, channelId, pageToken);
      return {
        videos: result.videos.slice(0, limit),
        nextPageToken: result.nextPageToken,
        source: 'api',
        feed,
        artistId,
        totalHint: result.nextPageToken
          ? 'Paginate to load the full catalog'
          : 'Full uploads playlist loaded',
      };
    } catch {
      // Invalid or expired API key — fall through to browse.
    }
  }

  try {
    const result = await fetchChannelViaBrowse(feedConfig.handle, pageToken, limit);
    return {
      videos: result.videos,
      nextPageToken: result.nextPageToken,
      source: 'browse',
      feed,
      artistId,
      totalHint: result.totalHint,
    };
  } catch (browseErr) {
    try {
      const videos = await fetchViaRss(channelId);
      return {
        videos: videos.slice(0, limit),
        source: 'rss',
        feed,
        artistId,
        totalHint: 'Showing latest videos via RSS fallback.',
      };
    } catch {
      throw browseErr;
    }
  }
}
