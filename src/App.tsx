import { useEffect, useState } from 'react';

import { ARTIST_THEMES } from './artists';
import { fetchArtists } from './api';
import { AccountsPanel } from './components/AccountsPanel';
import { ArtistSwitcher } from './components/ArtistSwitcher';
import { MusicPanel } from './components/MusicPanel';
import { TabNav } from './components/TabNav';
import { VideosPanel } from './components/VideosPanel';
import type { ArtistId, ArtistSummary, TabId } from './types';
import './App.css';

function App() {
  const [tab, setTab] = useState<TabId>('videos');
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [activeArtist, setActiveArtist] = useState<ArtistId>('justin');

  useEffect(() => {
    void fetchArtists()
      .then((data) => setArtists(data.artists))
      .catch(() => undefined);
  }, []);

  const current = artists.find((a) => a.id === activeArtist);
  const theme = ARTIST_THEMES[activeArtist];

  return (
    <div className={`app theme-${activeArtist}`}>
      <div className="deco-strip deco-strip--top" aria-hidden="true" />
      <div className="deco-strip deco-strip--side" aria-hidden="true" />

      <header className="hero">
        <div className="hero-split" aria-hidden="true">
          <div className="hero-split-half hero-split-half--justin" />
          <div className="hero-split-half hero-split-half--ariana" />
        </div>
        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker sticker--pink">{theme.sticker1}</span>
          <span className="sticker sticker--cyan">{theme.sticker2}</span>
          <span className="sticker sticker--yellow">{theme.sticker3}</span>
        </div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-tape hero-tape--left" aria-hidden="true" />
        <div className="hero-tape hero-tape--right" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">
            <span className="eyebrow-jp">デュアルポップハブ</span>
            <span className="eyebrow-en">Dual Pop Hub</span>
          </p>

          <div className="hero-duo">
            <div className={`hero-duo-card ${activeArtist === 'justin' ? 'active' : ''}`}>
              <span className="hero-duo-emoji">♛</span>
              <span className="hero-duo-name">Justin Bieber</span>
              <span className="hero-duo-jp">ジャスティン・ビーバー</span>
            </div>
            <span className="hero-duo-x">×</span>
            <div className={`hero-duo-card ${activeArtist === 'ariana' ? 'active' : ''}`}>
              <span className="hero-duo-emoji">☁</span>
              <span className="hero-duo-name">Ariana Grande</span>
              <span className="hero-duo-jp">アリアナ・グランデ</span>
            </div>
          </div>

          {current && (
            <>
              <h1>
                <span className="title-main">{current.name}</span>
                <span className="title-sub">{current.nameJp}</span>
              </h1>
              <p className="subtitle">
                Watch every video, blast the full catalog, and dive into every official account —
                Harajuku energy for {current.fanName}.
              </p>
            </>
          )}

          {artists.length > 0 && (
            <ArtistSwitcher artists={artists} active={activeArtist} onChange={setActiveArtist} />
          )}

          <div className="hero-badges" aria-hidden="true">
            <span className="badge">♪ MUSIC</span>
            <span className="badge">▶ VIDS</span>
            <span className="badge">◎ LINKS</span>
          </div>
        </div>
      </header>

      <TabNav active={tab} onChange={setTab} />

      <main className="main-panel">
        <div className="panel-tape" aria-hidden="true" />
        {tab === 'videos' && <VideosPanel artist={activeArtist} />}
        {tab === 'music' && current && (
          <MusicPanel
            artist={activeArtist}
            artistName={current.name}
            spotifyArtistId={current.spotifyArtistId}
          />
        )}
        {tab === 'accounts' && <AccountsPanel artist={activeArtist} />}
      </main>

      <footer className="footer">
        <p>
          <span className="footer-jp">ビリーバー & アリアネーター向け</span>
          Built for Beliebers & Arianators · Data from YouTube & Spotify
        </p>
      </footer>
    </div>
  );
}

export default App;
