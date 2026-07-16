import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ARTISTS,
  type Artist,
  type CustomArtistInput,
  getBuiltinArtist,
  isBuiltinArtistId,
} from './artists.js';
import { lookupArtist } from './artistLookup.js';
import { buildCustomArtist } from './customArtist.js';
import { getAlbumTracks, getSpotifyCatalog } from './spotify.js';
import { getYouTubeVideos } from './youtube.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '64kb' }));

function resolveArtist(artistId: unknown, profile?: CustomArtistInput): Artist {
  if (profile?.name) return buildCustomArtist(profile);
  const id = typeof artistId === 'string' ? artistId : 'justin';
  if (isBuiltinArtistId(id)) return getBuiltinArtist(id);
  throw new Error(`Unknown artist "${id}". Add the artist profile in the app.`);
}

function artistPayload(artist: Artist) {
  return {
    id: artist.id,
    name: artist.name,
    nameJp: artist.nameJp,
    tagline: artist.tagline,
    fanName: artist.fanName,
    fanNameJp: artist.fanNameJp,
    spotifyArtistId: artist.spotifyArtistId,
    custom: Boolean(artist.custom),
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', artists: Object.values(ARTISTS).map((a) => a.name) });
});

app.get('/api/artists', (_req, res) => {
  res.json({
    artists: Object.values(ARTISTS).map((artist) => artistPayload(artist)),
  });
});

app.get('/api/artists/lookup', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  if (!query) {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  try {
    const result = await lookupArtist(query, {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/api/accounts', (req, res) => {
  try {
    const artist = resolveArtist(req.query.artist);
    res.json({
      artist: {
        id: artist.id,
        name: artist.name,
        tagline: artist.tagline,
        fanName: artist.fanName,
      },
      accounts: artist.socialAccounts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.post('/api/accounts', (req, res) => {
  try {
    const artist = resolveArtist(req.body?.artist, req.body?.profile);
    res.json({
      artist: {
        id: artist.id,
        name: artist.name,
        tagline: artist.tagline,
        fanName: artist.fanName,
      },
      accounts: artist.socialAccounts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.get('/api/youtube/feeds', (req, res) => {
  try {
    const artist = resolveArtist(req.query.artist);
    res.json({
      artistId: artist.id,
      feeds: Object.values(artist.youtubeFeeds),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.post('/api/youtube/feeds', (req, res) => {
  try {
    const artist = resolveArtist(req.body?.artist, req.body?.profile);
    res.json({
      artistId: artist.id,
      feeds: Object.values(artist.youtubeFeeds),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

async function handleYouTubeVideos(
  artist: Artist,
  feedParam: unknown,
  pageToken?: string,
  limit = 50,
) {
  const feed = feedParam === 'official' || feedParam === 'vevo' ? feedParam : undefined;
  return getYouTubeVideos({
    artist,
    feed,
    apiKey: process.env.YOUTUBE_API_KEY,
    pageToken,
    limit,
  });
}

app.get('/api/youtube/videos', async (req, res) => {
  try {
    const artist = resolveArtist(req.query.artist);
    const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const result = await handleYouTubeVideos(artist, req.query.feed, pageToken, limit);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/youtube/videos', async (req, res) => {
  try {
    const artist = resolveArtist(req.body?.artist, req.body?.profile);
    const pageToken = typeof req.body?.pageToken === 'string' ? req.body.pageToken : undefined;
    const limit = req.body?.limit ? Number(req.body.limit) : 50;
    const result = await handleYouTubeVideos(artist, req.body?.feed, pageToken, limit);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/api/spotify/catalog', async (req, res) => {
  try {
    const artist = resolveArtist(req.query.artist);
    const result = await getSpotifyCatalog({
      artist,
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/spotify/catalog', async (req, res) => {
  try {
    const artist = resolveArtist(req.body?.artist, req.body?.profile);
    const result = await getSpotifyCatalog({
      artist,
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/api/spotify/albums/:albumId/tracks', async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(400).json({
      error: 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env for album tracks',
    });
    return;
  }

  try {
    const tracks = await getAlbumTracks(req.params.albumId, clientId, clientSecret);
    res.json({ tracks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Serve built frontend locally (Vercel serves dist/ statically in production).
if (!process.env.VERCEL) {
  const distPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

export default app;
