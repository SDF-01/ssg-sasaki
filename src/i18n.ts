export type Locale = 'en' | 'ja';

export const APP_TITLE = 'Hibiki Special Movie';
export const HIBIKI_NAME = 'Hibiki';
export const HIBIKI_NAME_JP = 'ヒビキ';

const LOCALE_STORAGE_KEY = 'hibiki-special-movie-locale';

export function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === 'ja' ? 'ja' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

const messages = {
  en: {
    'lang.toggle': '日本語',
    'lang.toggleAria': 'Switch app to Japanese',
    'hero.eyebrow': '♡ For Hibiki ♡',
    'hero.hibikiTag': 'main character',
    'hero.hibikiPick': 'Hibiki is vibing to',
    'hero.subtitle':
      '{{artist}} — videos, songs & links in Hibiki\'s sparkly J-pop world. Harajuku cute energy for {{fanName}}!',
    'hero.addSubtitle':
      'Add a new fave for Hibiki — a whole cute page pops up with MVs, music & links ♡',
    'footer.jp': 'ヒビキちゃんのスペシャルムービー',
    'footer.forHibiki': 'made with ♡ for Hibiki',
    'footer.data': 'YouTube & Spotify',
    'badge.music': '♫ J-POP',
    'badge.vids': '▶ MV',
    'badge.links': '♡ SNS',
    'badge.add': '✧ 推し追加',
    'tab.videos': 'MV',
    'tab.music': 'Music',
    'tab.accounts': 'SNS',
    'tab.add': 'Add ♡',
    'tab.navAria': 'Main sections',
    'artist.custom': 'custom',
    'artist.switcherAria': 'Choose artist',
    'add.title': 'Add Hibiki\'s next fave ♡',
    'add.intro':
      'Give Hibiki a new artist page — MVs, music & links, just like Justin, Ariana & RADWIMPS!',
    'add.name': 'Artist name *',
    'add.nameJp': 'Japanese name',
    'add.youtubePrimary': 'YouTube video channel *',
    'add.youtubeSecondary': 'Second YouTube channel',
    'add.spotifyId': 'Spotify artist ID',
    'add.spotifyUrl': 'Or Spotify URL',
    'add.instagram': 'Instagram URL',
    'add.tiktok': 'TikTok URL',
    'add.tagline': 'Tagline',
    'add.fanName': 'Fan name',
    'add.pageId': 'Page id:',
    'add.submit': 'Create artist page',
    'add.listTitle': 'Hibiki\'s added faves',
    'add.openPage': 'Open page',
    'add.removeAria': 'Remove {{name}}',
    'add.error.nameRequired': 'Artist name is required.',
    'add.error.youtubeRequired': 'Add at least one YouTube channel handle (e.g. @taylorswift or @taylorswiftvevo).',
    'add.placeholder.name': 'Taylor Swift',
    'add.placeholder.nameJp': 'テイラー・スウィフト',
    'add.placeholder.youtubePrimary': '@artistvevo or main channel @artist',
    'add.placeholder.youtubeSecondary': '@artist (optional)',
    'add.placeholder.spotifyId': 'From open.spotify.com/artist/…',
    'add.placeholder.spotifyUrl': 'https://open.spotify.com/artist/…',
    'add.placeholder.instagram': 'https://instagram.com/…',
    'add.placeholder.tiktok': 'https://tiktok.com/@…',
    'add.placeholder.tagline': 'Hibiki\'s #1 summer crush artist',
    'add.placeholder.fanName': 'Swifties',
    'add.defaultTagline': 'Hibiki picked this',
    'videos.loading': 'Loading YouTube catalog…',
    'videos.retry': 'Retry connection',
    'videos.feedAria': 'YouTube channel',
    'videos.openYoutube': 'Open on YouTube ↗',
    'videos.selectVideo': 'Select a video to watch',
    'videos.source': 'Source:',
    'videos.source.api': 'YouTube Data API',
    'videos.source.rss': 'YouTube RSS feed',
    'videos.source.browse': 'YouTube channel catalog',
    'videos.catalogVevo': 'VEVO Catalog',
    'videos.catalogAll': 'All Videos',
    'videos.searching': 'Searching… {{count}} loaded',
    'videos.filtered': '{{filtered}} of {{total}}',
    'videos.loaded': '{{count}} loaded',
    'videos.searchLabel': 'Search catalog',
    'videos.searchPlaceholder': 'Find a video… e.g. Break Free',
    'videos.clearSearch': 'Clear search',
    'videos.searchingDeeper': 'Searching deeper in catalog… {{count}} videos checked',
    'videos.noMatch': 'No videos match {{query}}{{loaded}}',
    'videos.inLoaded': ' in {{count}} loaded',
    'videos.published': 'Published {{date}}',
    'videos.loadMore': 'Load more videos',
    'videos.loadingMore': 'Loading…',
    'music.loading': 'Loading discography…',
    'music.streamOn': 'Stream {{name}} on Spotify',
    'music.noSpotify': 'Add a Spotify artist ID when creating this artist to embed their player here.',
    'music.topTracks': 'Top Tracks',
    'music.nowPlaying': 'Now playing preview:',
    'music.noPreview': ' — no 30s preview; open in Spotify',
    'music.albums': 'Albums & Singles',
    'music.releases': '{{count}} releases',
    'music.tracks': '{{count}} tracks',
    'music.unlockTitle': 'Unlock full discography browsing',
    'music.unlockBody': 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your .env file to browse every album, single, and 30-second previews in-app. The Spotify embed above still streams everything right now.',
    'accounts.loading': 'Loading official accounts…',
    'accounts.intro': 'Every verified {{name}} profile in one place — streaming, social, and official site.',
    'accounts.builtFor': 'For Hibiki &',
  },
  ja: {
    'lang.toggle': 'English',
    'lang.toggleAria': 'アプリを英語に切り替える',
    'hero.eyebrow': '♡ ヒビキちゃんへ ♡',
    'hero.hibikiTag': '主人公',
    'hero.hibikiPick': 'ヒビキの今イチオシ',
    'hero.subtitle':
      '{{artist}} — ヒビキのきらきらJ-POPワールドで動画・音楽・リンクを楽しもう！{{fanName}}も一緒に♡',
    'hero.addSubtitle': 'ヒビキの新しい推しを追加 — MV・音楽・リンク付きのかわいいページがすぐできる♡',
    'footer.jp': 'ヒビキちゃんのスペシャルムービー',
    'footer.forHibiki': 'ヒビキちゃんへの愛を込めて ♡',
    'footer.data': 'YouTube・Spotify',
    'badge.music': '♫ J-POP',
    'badge.vids': '▶ MV',
    'badge.links': '♡ SNS',
    'badge.add': '✧ 推し追加',
    'tab.videos': 'MV',
    'tab.music': '音楽',
    'tab.accounts': 'SNS',
    'tab.add': '追加♡',
    'tab.navAria': 'メインセクション',
    'artist.custom': 'カスタム',
    'artist.switcherAria': 'アーティストを選択',
    'add.title': 'ヒビキの推しを追加♡',
    'add.intro':
      'ヒビキのためにアーティストページを追加 — ジャスティン・アリアナ・RADWIMPSと同じようにMV・音楽・リンクが作れます！',
    'add.name': 'アーティスト名 *',
    'add.nameJp': '日本語名',
    'add.youtubePrimary': 'YouTube動画チャンネル *',
    'add.youtubeSecondary': '2つ目のYouTubeチャンネル',
    'add.spotifyId': 'SpotifyアーティストID',
    'add.spotifyUrl': 'またはSpotify URL',
    'add.instagram': 'Instagram URL',
    'add.tiktok': 'TikTok URL',
    'add.tagline': 'キャッチコピー',
    'add.fanName': 'ファン名',
    'add.pageId': 'ページID:',
    'add.submit': 'アーティストページを作成',
    'add.listTitle': 'ヒビキが追加した推し',
    'add.openPage': 'ページを開く',
    'add.removeAria': '{{name}}を削除',
    'add.error.nameRequired': 'アーティスト名は必須です。',
    'add.error.youtubeRequired': 'YouTubeチャンネル（@taylorswift など）を1つ以上入力してください。',
    'add.placeholder.name': 'Taylor Swift',
    'add.placeholder.nameJp': 'テイラー・スウィフト',
    'add.placeholder.youtubePrimary': '@artistvevo またはメインチャンネル @artist',
    'add.placeholder.youtubeSecondary': '@artist（任意）',
    'add.placeholder.spotifyId': 'open.spotify.com/artist/… から',
    'add.placeholder.spotifyUrl': 'https://open.spotify.com/artist/…',
    'add.placeholder.instagram': 'https://instagram.com/…',
    'add.placeholder.tiktok': 'https://tiktok.com/@…',
    'add.placeholder.tagline': 'ヒビキの夏のNo.1推し',
    'add.placeholder.fanName': 'Swifties',
    'add.defaultTagline': 'ヒビキが追加',
    'videos.loading': 'YouTubeカタログを読み込み中…',
    'videos.retry': '再接続',
    'videos.feedAria': 'YouTubeチャンネル',
    'videos.openYoutube': 'YouTubeで開く ↗',
    'videos.selectVideo': '動画を選んで再生',
    'videos.source': 'ソース:',
    'videos.source.api': 'YouTube Data API',
    'videos.source.rss': 'YouTube RSS',
    'videos.source.browse': 'YouTubeチャンネル',
    'videos.catalogVevo': 'VEVOカタログ',
    'videos.catalogAll': 'すべての動画',
    'videos.searching': '検索中… {{count}}件読み込み',
    'videos.filtered': '{{filtered}} / {{total}}',
    'videos.loaded': '{{count}}件読み込み',
    'videos.searchLabel': 'カタログを検索',
    'videos.searchPlaceholder': '動画を探す… 例: Break Free',
    'videos.clearSearch': '検索をクリア',
    'videos.searchingDeeper': 'カタログをさらに検索中… {{count}}件確認済み',
    'videos.noMatch': '「{{query}}」に一致する動画がありません{{loaded}}',
    'videos.inLoaded': '（{{count}}件中）',
    'videos.published': '公開日 {{date}}',
    'videos.loadMore': 'さらに読み込む',
    'videos.loadingMore': '読み込み中…',
    'music.loading': 'ディスコグラフィーを読み込み中…',
    'music.streamOn': '{{name}}をSpotifyで聴く',
    'music.noSpotify': 'アーティスト作成時にSpotify IDを追加すると、ここにプレイヤーが表示されます。',
    'music.topTracks': '人気曲',
    'music.nowPlaying': 'プレビュー再生中:',
    'music.noPreview': ' — 30秒プレビューなし。Spotifyで開いてください',
    'music.albums': 'アルバム＆シングル',
    'music.releases': '{{count}}リリース',
    'music.tracks': '{{count}}曲',
    'music.unlockTitle': 'フルディスコグラフィーを表示',
    'music.unlockBody': '.env に SPOTIFY_CLIENT_ID と SPOTIFY_CLIENT_SECRET を追加すると、アプリ内でアルバム・シングル・30秒プレビューを閲覧できます。上のSpotify埋め込みは今すぐ使えます。',
    'accounts.loading': '公式アカウントを読み込み中…',
    'accounts.intro': '認証済みの{{name}}プロフィールをまとめて表示 — ストリーミング、SNS、公式サイト。',
    'accounts.builtFor': 'ヒビキ＆',
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  let str: string = messages[locale][key] ?? messages.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return str;
}
