import type { YouTubeVideo } from './youtube.js';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const INNERTUBE_CLIENT = {
  clientName: 'WEB',
  clientVersion: '2.20250710.00.00',
  hl: 'en',
  gl: 'US',
};

function extractLockupVideos(obj: unknown): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;

    const record = node as Record<string, unknown>;
    const lockup = record.lockupViewModel as Record<string, unknown> | undefined;

    if (lockup?.contentId && typeof lockup.contentId === 'string') {
      const metadata = lockup.metadata as Record<string, unknown> | undefined;
      const lockupMeta = metadata?.lockupMetadataViewModel as Record<string, unknown> | undefined;
      const titleObj = lockupMeta?.title as { content?: string } | undefined;
      const contentImage = lockup.contentImage as Record<string, unknown> | undefined;
      const thumbModel = contentImage?.thumbnailViewModel as Record<string, unknown> | undefined;
      const image = thumbModel?.image as { sources?: Array<{ url: string }> } | undefined;
      const thumbUrl = image?.sources?.[image.sources.length - 1]?.url;

      videos.push({
        id: lockup.contentId,
        title: titleObj?.content ?? 'Untitled',
        publishedAt: '',
        thumbnail: thumbUrl ?? `https://i.ytimg.com/vi/${lockup.contentId}/hqdefault.jpg`,
        description: '',
      });
    }

    if (Array.isArray(node)) node.forEach(walk);
    else Object.values(record).forEach(walk);
  }

  walk(obj);
  return videos;
}

function findGridContinuationToken(data: unknown): string | undefined {
  let token: string | undefined;

  function walk(node: unknown) {
    if (!node || typeof node !== 'object' || token) return;

    const record = node as Record<string, unknown>;
    const continuationItem = record.continuationItemRenderer as Record<string, unknown> | undefined;
    const endpoint = continuationItem?.continuationEndpoint as Record<string, unknown> | undefined;
    const command = endpoint?.continuationCommand as { token?: string } | undefined;

    if (command?.token) token = command.token;

    if (Array.isArray(node)) node.forEach(walk);
    else Object.values(record).forEach(walk);
  }

  walk(data);
  return token;
}

function parseYtInitialData(html: string): unknown {
  const patterns = [
    /var ytInitialData = (.+?);<\/script>/,
    /window\["ytInitialData"\] = (.+?);<\/script>/,
    /ytInitialData\s*=\s*(\{.+?\});/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return JSON.parse(match[1]) as unknown;
  }

  throw new Error('Could not parse YouTube channel page');
}

async function postBrowse(continuation: string, visitorData?: string) {
  const res = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
    method: 'POST',
    headers: {
      ...BROWSER_HEADERS,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context: {
        client: {
          ...INNERTUBE_CLIENT,
          ...(visitorData ? { visitorData } : {}),
        },
      },
      continuation,
    }),
  });

  if (!res.ok) throw new Error(`YouTube browse API failed: ${res.status}`);
  return res.json() as Promise<unknown>;
}

export async function fetchChannelViaBrowse(
  handle: string,
  pageToken?: string,
  limit = 50,
): Promise<{
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalHint: string;
}> {
  if (pageToken) {
    const data = await postBrowse(pageToken);
    const videos = extractLockupVideos(data);
    const nextPageToken = findGridContinuationToken(data);

    return {
      videos: videos.slice(0, limit),
      nextPageToken,
      totalHint: `Full ${handle} catalog via YouTube browse`,
    };
  }

  const res = await fetch(`https://www.youtube.com/${handle}/videos`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) throw new Error(`YouTube channel page failed: ${res.status}`);

  const html = await res.text();
  const data = parseYtInitialData(html);
  const responseContext = data as { responseContext?: { visitorData?: string } };
  const videos = extractLockupVideos(data);
  if (videos.length === 0) {
    throw new Error(`YouTube returned no videos for ${handle}. The page layout may have changed.`);
  }
  let continuation = findGridContinuationToken(data);
  const visitorData = responseContext.responseContext?.visitorData;

  while (continuation && videos.length < limit) {
    const next = await postBrowse(continuation, visitorData);
    videos.push(...extractLockupVideos(next));
    continuation = findGridContinuationToken(next);
  }

  return {
    videos: videos.slice(0, limit),
    nextPageToken: continuation,
    totalHint: continuation
      ? `${videos.length}+ videos loaded — use Load more for the rest`
      : `Full catalog loaded (${videos.length} videos)`,
  };
}
