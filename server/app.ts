import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ARTISTS, getArtist, parseArtistId } from './artists.js';
import { getAlbumTracks, getSpotifyCatalog } from './spotify.js';
import { getYouTubeVideos } from './youtube.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', artists: Object.values(ARTISTS).map((a) => a.name) });
});

app.get('/api/artists', (_req, res) => {
  res.json({
    artists: Object.values(ARTISTS).map((artist) => ({
      id: artist.id,
      name: artist.name,
      nameJp: artist.nameJp,
      tagline: artist.tagline,
      fanName: artist.fanName,
      fanNameJp: artist.fanNameJp,
      spotifyArtistId: artist.spotifyArtistId,
    })),
  });
});

app.get('/api/accounts', (req, res) => {
  const artist = getArtist(parseArtistId(req.query.artist));
  res.json({
    artist: {
      id: artist.id,
      name: artist.name,
      tagline: artist.tagline,
      fanName: artist.fanName,
    },
    accounts: artist.socialAccounts,
  });
});

app.get('/api/youtube/feeds', (req, res) => {
  const artist = getArtist(parseArtistId(req.query.artist));
  res.json({
    artistId: artist.id,
    feeds: Object.values(artist.youtubeFeeds),
  });
});

app.get('/api/youtube/videos', async (req, res) => {
  try {
    const artistId = parseArtistId(req.query.artist);
    const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const feedParam = typeof req.query.feed === 'string' ? req.query.feed : 'vevo';
    const feed = feedParam === 'official' || feedParam === 'vevo' ? feedParam : 'vevo';

    const result = await getYouTubeVideos({
      artistId,
      feed,
      apiKey: process.env.YOUTUBE_API_KEY,
      pageToken,
      limit,
    });

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/api/spotify/catalog', async (req, res) => {
  try {
    const result = await getSpotifyCatalog({
      artistId: parseArtistId(req.query.artist),
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
