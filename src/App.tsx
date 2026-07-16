import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_ARTIST, getArtistTheme, getThemeClass } from './artists';
import { fetchArtists } from './api';
import { customArtistToSummary, loadCustomArtists } from './customArtists';
import { HIBIKI_NAME, HIBIKI_NAME_JP } from './i18n';
import { useLanguage } from './LanguageProvider';
import { AccountsPanel } from './components/AccountsPanel';
import { AddArtistPanel } from './components/AddArtistPanel';
import { ArtistSwitcher } from './components/ArtistSwitcher';
import { CuteOverlays, HibikiChibiFace } from './components/CuteOverlays';
import { LanguageToggle } from './components/LanguageToggle';
import { MusicPanel } from './components/MusicPanel';
import { TabNav } from './components/TabNav';
import { VideosPanel } from './components/VideosPanel';
import type { ArtistId, ArtistSummary, CustomArtistProfile, TabId } from './types';
import './App.css';

function App() {
  const { locale, tr } = useLanguage();
  const [tab, setTab] = useState<TabId>('videos');
  const [builtinArtists, setBuiltinArtists] = useState<ArtistSummary[]>([]);
  const [customArtists, setCustomArtists] = useState<CustomArtistProfile[]>(() =>
    loadCustomArtists(),
  );
  const [activeArtist, setActiveArtist] = useState<ArtistId>(DEFAULT_ARTIST);

  useEffect(() => {
    void fetchArtists()
      .then((data) => setBuiltinArtists(data.artists))
      .catch(() => undefined);
  }, []);

  const artists = useMemo(
    () => [...builtinArtists, ...customArtists.map(customArtistToSummary)],
    [builtinArtists, customArtists],
  );

  const current = artists.find((a) => a.id === activeArtist);
  const activeProfile = customArtists.find((a) => a.id === activeArtist);
  const theme = getArtistTheme(activeArtist);
  const themeClass = getThemeClass(activeArtist);
  const displayName =
    current && locale === 'ja' ? current.nameJp || current.name : current?.name;
  const hibikiName = locale === 'ja' ? HIBIKI_NAME_JP : HIBIKI_NAME;

  return (
    <div className={`app hibiki-app ${themeClass} lang-${locale}`}>
      <CuteOverlays />
      <div className="cute-floats" aria-hidden="true">
        <span className="cute-float cute-float--1">♡</span>
        <span className="cute-float cute-float--2">✨</span>
        <span className="cute-float cute-float--3">♪</span>
        <span className="cute-float cute-float--4">🎀</span>
        <span className="cute-float cute-float--5">💖</span>
        <span className="cute-float cute-float--6">✧</span>
      </div>
      <div className="deco-strip deco-strip--top" aria-hidden="true" />
      <div className="deco-strip deco-strip--side" aria-hidden="true" />

      <header className="hero">
        <div className="hero-accent" aria-hidden="true" />
        <div className="hero-sparkles" aria-hidden="true">
          <span className="hero-sparkle hero-sparkle--1">✦</span>
          <span className="hero-sparkle hero-sparkle--2">✧</span>
          <span className="hero-sparkle hero-sparkle--3">♡</span>
        </div>
        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker sticker--pink">{theme.sticker1}</span>
          <span className="sticker sticker--cyan">{theme.sticker2}</span>
          <span className="sticker sticker--yellow">{theme.sticker3}</span>
        </div>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-tape hero-tape--left" aria-hidden="true" />
        <div className="hero-tape hero-tape--right" aria-hidden="true" />
        <span className="onomatopoeia onomatopoeia--1" aria-hidden="true">
          {locale === 'ja' ? 'キラキラ' : 'sparkle'}
        </span>
        <span className="onomatopoeia onomatopoeia--2" aria-hidden="true">
          {locale === 'ja' ? 'ふわふわ' : 'fluffy'}
        </span>
        <div className="hero-content">
          <LanguageToggle />

          <div className="hibiki-star" aria-label={hibikiName}>
            <span className="hibiki-speech" aria-hidden="true">
              {tr('hero.hibikiCheer')}
            </span>
            <span className="hibiki-star__bow" aria-hidden="true">
              🎀
            </span>
            <span className="hibiki-star__halo" aria-hidden="true" />
            <span className="hibiki-star__sparkle hibiki-star__sparkle--1" aria-hidden="true">
              ✦
            </span>
            <span className="hibiki-star__sparkle hibiki-star__sparkle--2" aria-hidden="true">
              ✧
            </span>
            <span className="hibiki-star__sparkle hibiki-star__sparkle--3" aria-hidden="true">
              ♡
            </span>
            <span className="hibiki-star__face">
              <HibikiChibiFace />
            </span>
            <span className="hibiki-star__name">{hibikiName}</span>
            <span className="hibiki-star__tag">{tr('hero.hibikiTag')}</span>
          </div>

          <p className="eyebrow">
            <span className="eyebrow-text">{tr('hero.eyebrow')}</span>
          </p>

          <h1 className="app-title">
            <span className="title-plate" aria-hidden="true" />
            <span className="title-sparkle title-sparkle--left" aria-hidden="true">
              ✨
            </span>
            <span className="title-main">{tr('app.title')}</span>
            <span className="title-sparkle title-sparkle--right" aria-hidden="true">
              ✨
            </span>
          </h1>
          <div className="title-ribbon" aria-hidden="true">
            <span className="title-ribbon__heart">♡</span>
            <span>J-POP</span>
            <span className="title-ribbon__heart">♡</span>
          </div>

          {current && tab !== 'add' && (
            <>
              <p className="title-sub artist-now-playing">
                <span className="hibiki-pick">{tr('hero.hibikiPick')}</span>
                <span className="hibiki-pick-artist">{displayName}</span>
              </p>
              <p className="subtitle">
                {tr('hero.subtitle', {
                  artist: displayName ?? current.name,
                  fanName: locale === 'ja' ? current.fanNameJp : current.fanName,
                })}
              </p>
            </>
          )}

          {tab === 'add' && <p className="subtitle">{tr('hero.addSubtitle')}</p>}

          {artists.length > 0 && tab !== 'add' && (
            <ArtistSwitcher artists={artists} active={activeArtist} onChange={setActiveArtist} />
          )}

          <div className="hero-badges" aria-hidden="true">
            <span className="badge">{tr('badge.music')}</span>
            <span className="badge">{tr('badge.vids')}</span>
            <span className="badge">{tr('badge.links')}</span>
            <span className="badge">{tr('badge.add')}</span>
          </div>
        </div>
      </header>

      <div className="tab-nav-shell">
        <span className="tab-nav-deco tab-nav-deco--l" aria-hidden="true">
          ♡
        </span>
        <TabNav active={tab} onChange={setTab} />
        <span className="tab-nav-deco tab-nav-deco--r" aria-hidden="true">
          ♡
        </span>
      </div>

      <main className="main-panel" data-tab={tab}>
        <div className="panel-binder" aria-hidden="true" />
        <div className="panel-tape" aria-hidden="true" />
        <span className="panel-charm" aria-hidden="true" />
        <div className="panel-inner panel-enter" key={tab}>
        {tab === 'videos' && <VideosPanel artist={activeArtist} profile={activeProfile} />}
        {tab === 'music' && current && (
          <MusicPanel
            artist={activeArtist}
            artistName={displayName ?? current.name}
            spotifyArtistId={current.spotifyArtistId}
            profile={activeProfile}
          />
        )}
        {tab === 'accounts' && <AccountsPanel artist={activeArtist} profile={activeProfile} />}
        {tab === 'add' && (
          <AddArtistPanel
            customArtists={customArtists}
            onArtistsChange={setCustomArtists}
            onSelectArtist={(id) => {
              setActiveArtist(id);
              setTab('videos');
            }}
            onDone={() => setTab('videos')}
          />
        )}
        </div>
      </main>

      <footer className="footer">
        <p>
          <span className="footer-jp">{tr('footer.jp')}</span>
          {tr('footer.forHibiki')} · {tr('app.title')}
        </p>
      </footer>
    </div>
  );
}

export default App;
