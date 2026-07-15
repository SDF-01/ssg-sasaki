import type { ArtistId } from './types';
import { isCustomArtistId } from './types';

export interface ArtistTheme {
  sticker1: string;
  sticker2: string;
  sticker3: string;
  emoji: string;
}

export const BUILTIN_THEMES: Record<string, ArtistTheme> = {
  justin: {
    sticker1: '♡ 原宿POP',
    sticker2: 'きらきら',
    sticker3: 'キュン!',
    emoji: '♡',
  },
  ariana: {
    sticker1: '☁ 天使',
    sticker2: 'グリッター',
    sticker3: 'LOVE♡',
    emoji: '☁',
  },
  radwimps: {
    sticker1: '♡ 映画主題歌',
    sticker2: '切ない',
    sticker3: '感動',
    emoji: '✧',
  },
};

export const CUSTOM_THEME: ArtistTheme = {
  sticker1: '♡ 推しNEW',
  sticker2: 'ヒビキ推し',
  sticker3: 'きゅん♡',
  emoji: '♡',
};

export function getArtistTheme(artistId: ArtistId): ArtistTheme {
  if (isCustomArtistId(artistId)) return CUSTOM_THEME;
  return BUILTIN_THEMES[artistId] ?? CUSTOM_THEME;
}

export function getThemeClass(artistId: ArtistId): string {
  if (isCustomArtistId(artistId)) return 'theme-custom';
  if (artistId === 'justin' || artistId === 'ariana' || artistId === 'radwimps') {
    return `theme-${artistId}`;
  }
  return 'theme-custom';
}

export const DEFAULT_ARTIST: ArtistId = 'justin';
