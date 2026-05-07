/**
 * Flow-Safe BGM Player — Filtering utilities
 * Removes clickbait titles and blocked categories
 */

// Clickbait / sensationalist patterns to exclude
const CLICKBAIT_PATTERN = /【悲報】|【速報】|ヤバい|やばい|！？|衝撃|炎上|暴露|緊急|号泣|激怒|驚愕|崩壊|終了|解散|引退|炎上|最悪|最強|神回|神曲|鬼畜|ドッキリ|サプライズ/i;

// YouTube category IDs to exclude (entertainment, gaming, news, etc.)
// 1=Film, 2=Autos, 17=Sports, 20=Gaming, 22=People&Blogs, 24=Entertainment, 25=News, 26=HowTo, 28=Science
const BLOCKED_CATEGORY_IDS = new Set(["1", "2", "17", "20", "22", "24", "25", "26", "28"]);

export interface VideoItem {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  thumbnail?: string;
}

export function isClickbait(title: string): boolean {
  return CLICKBAIT_PATTERN.test(title);
}

export function isBlockedCategory(categoryId?: string): boolean {
  if (!categoryId) return false;
  return BLOCKED_CATEGORY_IDS.has(categoryId);
}

export function filterVideos(
  videos: VideoItem[],
  blacklistChannels: string[],
  blacklistVideos: string[]
): VideoItem[] {
  const bcSet = new Set(blacklistChannels);
  const bvSet = new Set(blacklistVideos);

  return videos.filter((v) => {
    if (bvSet.has(v.id)) return false;
    if (bcSet.has(v.channelId)) return false;
    if (isClickbait(v.title)) return false;
    if (isBlockedCategory(v.categoryId)) return false;
    return true;
  });
}

/**
 * Sort videos: whitelist channels first, then others
 */
export function sortByWhitelist(videos: VideoItem[], whitelistChannels: string[]): VideoItem[] {
  const wSet = new Set(whitelistChannels);
  return [...videos].sort((a, b) => {
    const aW = wSet.has(a.channelId) ? 0 : 1;
    const bW = wSet.has(b.channelId) ? 0 : 1;
    return aW - bW;
  });
}
