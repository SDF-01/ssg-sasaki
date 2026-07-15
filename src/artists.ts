import type { ArtistId } from './types';

export interface ArtistTheme {
  sticker1: string;
  sticker2: string;
  sticker3: string;
  emoji: string;
}

export const ARTIST_THEMES: Record<ArtistId, ArtistTheme> = {
  justin: {
    sticker1: '★ POP',
    sticker2: '原宿',
    sticker3: 'PUNK!',
    emoji: '♛',
  },
  ariana: {
    sticker1: '☁ CLOUD',
    sticker2: 'グリム',
    sticker3: 'GLOW!',
    emoji: '☁',
  },
};

export const DEFAULT_ARTIST: ArtistId = 'justin';
