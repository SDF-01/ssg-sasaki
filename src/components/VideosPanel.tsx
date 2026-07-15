import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchYouTubeFeeds, fetchYouTubeVideos } from '../api';
import type { ArtistId, YouTubeFeed, YouTubeFeedId, YouTubeVideo } from '../types';

const SOURCE_LABELS = {
  api: 'YouTube Data API',
  rss: 'YouTube RSS feed',
  browse: 'YouTube channel catalog',
} as const;

const SEARCH_DEBOUNCE_MS = 350;
const MAX_SEARCH_EXTRA_PAGES = 12;

function matchesQuery(video: YouTubeVideo, query: string): boolean {
  const haystack = `${video.title} ${video.description}`.toLowerCase();
  return haystack.includes(query);
}

function dedupeVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
  const seen = new Set<string>();
  return videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });
}

interface VideosPanelProps {
  artist: ArtistId;
}

export function VideosPanel({ artist }: VideosPanelProps) {
  const [feeds, setFeeds] = useState<YouTubeFeed[]>([]);
  const [activeFeed, setActiveFeed] = useState<YouTubeFeedId>('vevo');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [source, setSource] = useState<'api' | 'rss' | 'browse'>('browse');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchPagesLoaded = useRef(0);

  useEffect(() => {
    setActiveFeed('vevo');
    setSearchQuery('');
    searchPagesLoaded.current = 0;
    void fetchYouTubeFeeds(artist)
      .then((data) => setFeeds(data.feeds))
      .catch(() => setFeeds([]));
  }, [artist]);

  const load = useCallback(
    async (pageToken?: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const data = await fetchYouTubeVideos({ artist, feed: activeFeed, pageToken });
        setVideos((prev) =>
          dedupeVideos(append ? [...prev, ...data.videos] : data.videos),
        );
        setNextPageToken(data.nextPageToken);
        setSource(data.source);
        setHint(data.totalHint ?? '');
        if (!append && data.videos.length > 0) setSelected(data.videos[0]);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFeed, artist],
  );

  useEffect(() => {
    searchPagesLoaded.current = 0;
    void load();
  }, [load]);

  useEffect(() => {
    setSearchQuery('');
    searchPagesLoaded.current = 0;
  }, [activeFeed]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredVideos = useMemo(() => {
    if (!normalizedQuery) return videos;
    return videos.filter((video) => matchesQuery(video, normalizedQuery));
  }, [videos, normalizedQuery]);

  useEffect(() => {
    if (!normalizedQuery || loading) {
      setSearchingCatalog(false);
      return;
    }

    const hasMatch = videos.some((video) => matchesQuery(video, normalizedQuery));
    if (hasMatch) {
      setSearchingCatalog(false);
      return;
    }

    if (!nextPageToken || searchPagesLoaded.current >= MAX_SEARCH_EXTRA_PAGES) {
      setSearchingCatalog(false);
      return;
    }

    if (loadingMore) {
      setSearchingCatalog(true);
      return;
    }

    setSearchingCatalog(true);
    const timer = setTimeout(() => {
      searchPagesLoaded.current += 1;
      void load(nextPageToken, true);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalizedQuery, videos, nextPageToken, loading, loadingMore, load]);

  const currentFeed = feeds.find((f) => f.id === activeFeed);

  if (loading) return <div className="panel-loading">Loading YouTube catalog…</div>;
  if (error) {
    return (
      <div className="panel-error">
        <p>{error}</p>
        <button type="button" className="load-more" onClick={() => void load()}>
          Retry connection
        </button>
      </div>
    );
  }

  return (
    <div className="videos-layout">
      <div className="player-column">
        <div className="feed-switcher" role="tablist" aria-label="YouTube channel">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              type="button"
              role="tab"
              aria-selected={activeFeed === feed.id}
              className={`feed-btn ${activeFeed === feed.id ? 'active' : ''}`}
              onClick={() => setActiveFeed(feed.id)}
            >
              {feed.label}
            </button>
          ))}
        </div>

        {currentFeed && (
          <p className="feed-description">
            {currentFeed.description}
            {' · '}
            <a href={currentFeed.url} target="_blank" rel="noopener noreferrer">
              Open on YouTube ↗
            </a>
          </p>
        )}

        {selected ? (
          <>
            <div className="video-embed">
              <iframe
                title={selected.title}
                src={`https://www.youtube.com/embed/${selected.id}?autoplay=0&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="now-playing">
              <h2>{selected.title}</h2>
              {selected.publishedAt ? (
                <p className="meta">
                  Published {new Date(selected.publishedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="muted">Select a video to watch</p>
        )}
        <p className="source-badge">
          Source: {SOURCE_LABELS[source]}
          {hint ? ` · ${hint}` : ''}
        </p>
      </div>

      <aside className="video-list">
        <header className="list-header">
          <h3>{activeFeed === 'vevo' ? 'VEVO Catalog' : 'All Videos'}</h3>
          <span>
            {searchingCatalog
              ? `Searching… ${videos.length} loaded`
              : normalizedQuery
                ? `${filteredVideos.length} of ${videos.length}`
                : `${videos.length} loaded`}
          </span>
        </header>

        <div className="video-search">
          <label className="video-search-label" htmlFor="video-catalog-search">
            Search catalog
          </label>
          <div className="video-search-row">
            <input
              id="video-catalog-search"
              type="search"
              className="video-search-input"
              placeholder="Find a video… e.g. Break Free"
              value={searchQuery}
              onChange={(e) => {
                searchPagesLoaded.current = 0;
                setSearchQuery(e.target.value);
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery ? (
              <button
                type="button"
                className="video-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  searchPagesLoaded.current = 0;
                  setSearchQuery('');
                }}
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <ul>
          {filteredVideos.length === 0 ? (
            <li className="video-search-empty">
              {searchingCatalog ? (
                <>Searching deeper in catalog… <strong>{videos.length}</strong> videos checked</>
              ) : (
                <>
                  No videos match <strong>{searchQuery}</strong>
                  {videos.length > 0 ? ` in ${videos.length} loaded` : ''}
                </>
              )}
            </li>
          ) : (
            filteredVideos.map((video) => (
              <li key={video.id}>
                <button
                  type="button"
                  className={`video-item ${selected?.id === video.id ? 'selected' : ''}`}
                  onClick={() => setSelected(video)}
                >
                  <img src={video.thumbnail} alt="" loading="lazy" />
                  <div>
                    <strong>{video.title}</strong>
                    {video.publishedAt ? (
                      <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
        {nextPageToken && !normalizedQuery && (
          <button
            type="button"
            className="load-more"
            disabled={loadingMore}
            onClick={() => void load(nextPageToken, true)}
          >
            {loadingMore ? 'Loading…' : 'Load more videos'}
          </button>
        )}
      </aside>
    </div>
  );
}
