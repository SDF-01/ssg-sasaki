import type { CustomArtistProfile } from './types';

const STORAGE_KEY = 'sgt-sasaki-custom-artists';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function createCustomArtistId(name: string): string {
  return `custom-${slugify(name) || 'artist'}`;
}

export function loadCustomArtists(): CustomArtistProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomArtistProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomArtists(artists: CustomArtistProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artists));
}

export function addCustomArtist(input: Omit<CustomArtistProfile, 'id'> & { id?: string }): CustomArtistProfile {
  const artists = loadCustomArtists();
  const id = input.id ?? createCustomArtistId(input.name);
  const existing = artists.findIndex((a) => a.id === id);
  const profile: CustomArtistProfile = { ...input, id };

  if (existing >= 0) artists[existing] = profile;
  else artists.push(profile);

  saveCustomArtists(artists);
  return profile;
}

export function removeCustomArtist(id: string): void {
  saveCustomArtists(loadCustomArtists().filter((a) => a.id !== id));
}

export function customArtistToSummary(profile: CustomArtistProfile) {
  return {
    id: profile.id,
    name: profile.name,
    nameJp: profile.nameJp ?? profile.name,
    tagline: profile.tagline ?? 'Hibiki picked this',
    fanName: profile.fanName ?? `${profile.name} fans`,
    fanNameJp: profile.fanNameJp ?? profile.fanName ?? profile.name,
    spotifyArtistId: profile.spotifyArtistId ?? '',
    custom: true,
  };
}
