export type ArtistId = 'justin' | 'ariana';

export type YouTubeFeedId = 'official' | 'vevo';

export interface YouTubeFeed {
  id: YouTubeFeedId;
  label: string;
  handle: string;
  channelId: string;
  url: string;
  description: string;
}

export interface SocialAccount {
  platform: string;
  handle: string;
  url: string;
  description: string;
  icon: string;
}

export interface Artist {
  id: ArtistId;
  name: string;
  nameJp: string;
  tagline: string;
  fanName: string;
  fanNameJp: string;
  spotifyArtistId: string;
  youtubeFeeds: Record<YouTubeFeedId, YouTubeFeed>;
  socialAccounts: SocialAccount[];
}

export const ARTISTS: Record<ArtistId, Artist> = {
  justin: {
    id: 'justin',
    name: 'Justin Bieber',
    nameJp: 'ジャスティン・ビーバー',
    tagline: 'Purpose · Justice · Music & Videos',
    fanName: 'Beliebers',
    fanNameJp: 'ビリーバー',
    spotifyArtistId: '1uNFoZAHBGtllmzzmc9mFz',
    youtubeFeeds: {
      vevo: {
        id: 'vevo',
        label: 'JustinBieberVEVO',
        handle: '@justinbiebervevo',
        channelId: 'UCHkj014U2CQ2Nv0UZeYpE_A',
        url: 'https://www.youtube.com/@justinbiebervevo',
        description: 'Official music videos and audio — full VEVO catalog',
      },
      official: {
        id: 'official',
        label: '@justinbieber',
        handle: '@justinbieber',
        channelId: 'UCIwFjwMjI0y7PDBVEO9-bkQ',
        url: 'https://www.youtube.com/@justinbieber',
        description: 'Personal channel — vlogs, live sets, and exclusives',
      },
    },
    socialAccounts: [
      {
        platform: 'Spotify',
        handle: 'Justin Bieber',
        url: 'https://open.spotify.com/artist/1uNFoZAHBGtllmzzmc9mFz',
        description: 'Albums, singles, and playlists',
        icon: 'spotify',
      },
      {
        platform: 'YouTube VEVO',
        handle: '@justinbiebervevo',
        url: 'https://www.youtube.com/@justinbiebervevo',
        description: 'Full music video catalog',
        icon: 'youtube',
      },
      {
        platform: 'YouTube',
        handle: '@justinbieber',
        url: 'https://www.youtube.com/@justinbieber',
        description: 'Official channel — live sets and exclusives',
        icon: 'youtube',
      },
      {
        platform: 'Apple Music',
        handle: 'Justin Bieber',
        url: 'https://music.apple.com/us/artist/justin-bieber/320569549',
        description: 'Stream on Apple Music',
        icon: 'apple',
      },
      {
        platform: 'Instagram',
        handle: '@justinbieber',
        url: 'https://www.instagram.com/justinbieber/',
        description: 'Photos and reels',
        icon: 'instagram',
      },
      {
        platform: 'TikTok',
        handle: '@justinbieber',
        url: 'https://www.tiktok.com/@justinbieber',
        description: 'Short clips and behind the scenes',
        icon: 'tiktok',
      },
      {
        platform: 'X (Twitter)',
        handle: '@justinbieber',
        url: 'https://x.com/justinbieber',
        description: 'Updates and announcements',
        icon: 'x',
      },
      {
        platform: 'Facebook',
        handle: 'Justin Bieber',
        url: 'https://www.facebook.com/JustinBieber',
        description: 'Official Facebook page',
        icon: 'facebook',
      },
      {
        platform: 'Deezer',
        handle: 'Justin Bieber',
        url: 'https://www.deezer.com/us/artist/288166',
        description: 'Stream on Deezer',
        icon: 'deezer',
      },
      {
        platform: 'SoundCloud',
        handle: 'Justin Bieber',
        url: 'https://soundcloud.com/justinbieber',
        description: 'Tracks and remixes',
        icon: 'soundcloud',
      },
      {
        platform: 'Tidal',
        handle: 'Justin Bieber',
        url: 'https://tidal.com/browse/artist/3639240',
        description: 'Hi-fi streaming',
        icon: 'tidal',
      },
      {
        platform: 'Amazon Music',
        handle: 'Justin Bieber',
        url: 'https://music.amazon.com/artists/B00137GRC2/justin-bieber',
        description: 'Stream on Amazon Music',
        icon: 'amazon',
      },
      {
        platform: 'Official Site',
        handle: 'justinbiebermusic.com',
        url: 'https://www.justinbiebermusic.com/',
        description: 'Tour dates and merch',
        icon: 'web',
      },
    ],
  },
  ariana: {
    id: 'ariana',
    name: 'Ariana Grande',
    nameJp: 'アリアナ・グランデ',
    tagline: 'eternal sunshine · Positions · thank u, next',
    fanName: 'Arianators',
    fanNameJp: 'アリアネーター',
    spotifyArtistId: '66CXWjxzNUsJzmJ6EUV0q6',
    youtubeFeeds: {
      vevo: {
        id: 'vevo',
        label: 'ArianaGrandeVEVO',
        handle: '@arianagrandevevo',
        channelId: 'UCCxoF_9Mh0DL6LWIM0GiMdg',
        url: 'https://www.youtube.com/@arianagrandevevo',
        description: 'Official music videos — full VEVO catalog',
      },
      official: {
        id: 'official',
        label: '@arianagrande',
        handle: '@arianagrande',
        channelId: 'UC9CoOnJkIBMdeiadB5Q_LLA',
        url: 'https://www.youtube.com/@arianagrande',
        description: 'Official channel — live performances and exclusives',
      },
    },
    socialAccounts: [
      {
        platform: 'Spotify',
        handle: 'Ariana Grande',
        url: 'https://open.spotify.com/artist/66CXWjxzNUsJzmJ6EUV0q6',
        description: 'Albums, singles, and playlists',
        icon: 'spotify',
      },
      {
        platform: 'YouTube VEVO',
        handle: '@arianagrandevevo',
        url: 'https://www.youtube.com/@arianagrandevevo',
        description: 'Full music video catalog',
        icon: 'youtube',
      },
      {
        platform: 'YouTube',
        handle: '@arianagrande',
        url: 'https://www.youtube.com/@arianagrande',
        description: 'Official channel — performances and exclusives',
        icon: 'youtube',
      },
      {
        platform: 'Apple Music',
        handle: 'Ariana Grande',
        url: 'https://music.apple.com/us/artist/ariana-grande/412778295',
        description: 'Stream on Apple Music',
        icon: 'apple',
      },
      {
        platform: 'Instagram',
        handle: '@arianagrande',
        url: 'https://www.instagram.com/arianagrande/',
        description: 'Photos and reels',
        icon: 'instagram',
      },
      {
        platform: 'TikTok',
        handle: '@arianagrande',
        url: 'https://www.tiktok.com/@arianagrande',
        description: 'Short clips and behind the scenes',
        icon: 'tiktok',
      },
      {
        platform: 'X (Twitter)',
        handle: '@ArianaGrande',
        url: 'https://x.com/ArianaGrande',
        description: 'Updates and announcements',
        icon: 'x',
      },
      {
        platform: 'Facebook',
        handle: 'Ariana Grande',
        url: 'https://www.facebook.com/arianagrande',
        description: 'Official Facebook page',
        icon: 'facebook',
      },
      {
        platform: 'Deezer',
        handle: 'Ariana Grande',
        url: 'https://www.deezer.com/us/artist/1562681',
        description: 'Stream on Deezer',
        icon: 'deezer',
      },
      {
        platform: 'SoundCloud',
        handle: 'Ariana Grande',
        url: 'https://soundcloud.com/arianagrande',
        description: 'Tracks and remixes',
        icon: 'soundcloud',
      },
      {
        platform: 'Tidal',
        handle: 'Ariana Grande',
        url: 'https://tidal.com/browse/artist/3639241',
        description: 'Hi-fi streaming',
        icon: 'tidal',
      },
      {
        platform: 'Amazon Music',
        handle: 'Ariana Grande',
        url: 'https://music.amazon.com/artists/B00B4F5KJQ/ariana-grande',
        description: 'Stream on Amazon Music',
        icon: 'amazon',
      },
      {
        platform: 'Official Site',
        handle: 'arianagrande.com',
        url: 'https://www.arianagrande.com/',
        description: 'Tour dates and merch',
        icon: 'web',
      },
    ],
  },
};

export function parseArtistId(value: unknown): ArtistId {
  return value === 'ariana' ? 'ariana' : 'justin';
}

export function getArtist(id: ArtistId): Artist {
  return ARTISTS[id];
}
