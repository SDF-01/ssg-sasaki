export type ArtistId = string;

export interface CustomArtistProfile {
  id: string;
  name: string;
  nameJp?: string;
  tagline?: string;
  fanName?: string;
  fanNameJp?: string;
  spotifyArtistId?: string;
  spotifyUrl?: string;
  youtubeVevoHandle?: string;
  youtubeOfficialHandle?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}

export interface ArtistSummary {
  id: ArtistId;
  name: string;
  nameJp: string;
  tagline: string;
  fanName: string;
  fanNameJp: string;
  spotifyArtistId: string;
  custom?: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
}

export interface SocialAccount {
  platform: string;
  handle: string;
  url: string;
  description: string;
  icon: string;
}

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

export type TabId = 'videos' | 'music' | 'accounts' | 'add';

export type YouTubeFeedId = 'official' | 'vevo';

export interface YouTubeFeed {
  id: YouTubeFeedId;
  label: string;
  handle: string;
  channelId: string;
  url: string;
  description: string;
}

export function isCustomArtistId(id: ArtistId): boolean {
  return id.startsWith('custom-');
}
