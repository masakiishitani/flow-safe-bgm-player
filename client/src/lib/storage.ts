/**
 * Flow-Safe BGM Player — localStorage utility
 * Manages whitelist/blacklist for Good/Bad evaluations
 */

const KEYS = {
  WHITELIST_CHANNELS: "flowsafe_whitelist_channels",
  BLACKLIST_CHANNELS: "flowsafe_blacklist_channels",
  BLACKLIST_VIDEOS: "flowsafe_blacklist_videos",
  SEARCH_KEYWORD: "flowsafe_search_keyword",
  VOLUME: "flowsafe_volume",
} as const;

function getList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setList(key: string, list: string[]): void {
  localStorage.setItem(key, JSON.stringify(Array.from(new Set(list))));
}

function addToList(key: string, id: string): void {
  const list = getList(key);
  if (!list.includes(id)) {
    setList(key, [...list, id]);
  }
}

// Whitelist (Good channels)
export const whitelist = {
  getChannels: () => getList(KEYS.WHITELIST_CHANNELS),
  addChannel: (channelId: string) => addToList(KEYS.WHITELIST_CHANNELS, channelId),
  hasChannel: (channelId: string) => getList(KEYS.WHITELIST_CHANNELS).includes(channelId),
};

// Blacklist (Bad channels & videos)
export const blacklist = {
  getChannels: () => getList(KEYS.BLACKLIST_CHANNELS),
  getVideos: () => getList(KEYS.BLACKLIST_VIDEOS),
  addChannel: (channelId: string) => addToList(KEYS.BLACKLIST_CHANNELS, channelId),
  addVideo: (videoId: string) => addToList(KEYS.BLACKLIST_VIDEOS, videoId),
  hasChannel: (channelId: string) => getList(KEYS.BLACKLIST_CHANNELS).includes(channelId),
  hasVideo: (videoId: string) => getList(KEYS.BLACKLIST_VIDEOS).includes(videoId),
};

// Search keyword
export const searchKeyword = {
  get: () => localStorage.getItem(KEYS.SEARCH_KEYWORD) ?? "lofi hip hop study",
  set: (kw: string) => localStorage.setItem(KEYS.SEARCH_KEYWORD, kw),
};

// Volume
export const volumeStore = {
  get: () => {
    const v = localStorage.getItem(KEYS.VOLUME);
    return v !== null ? parseInt(v, 10) : 80;
  },
  set: (v: number) => localStorage.setItem(KEYS.VOLUME, String(v)),
};

// Export/Import
export function exportData(): string {
  return JSON.stringify({
    whitelist_channels: whitelist.getChannels(),
    blacklist_channels: blacklist.getChannels(),
    blacklist_videos: blacklist.getVideos(),
    search_keyword: searchKeyword.get(),
  }, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.whitelist_channels) setList(KEYS.WHITELIST_CHANNELS, data.whitelist_channels);
    if (data.blacklist_channels) setList(KEYS.BLACKLIST_CHANNELS, data.blacklist_channels);
    if (data.blacklist_videos) setList(KEYS.BLACKLIST_VIDEOS, data.blacklist_videos);
    if (data.search_keyword) searchKeyword.set(data.search_keyword);
    return true;
  } catch {
    return false;
  }
}
