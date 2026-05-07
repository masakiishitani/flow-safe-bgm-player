/**
 * Flow-Safe BGM Player — YouTube Data API v3 utilities
 * API key is stored in .env as VITE_YOUTUBE_API_KEY
 */

import { VideoItem } from "./filter";

const API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  return import.meta.env.VITE_YOUTUBE_API_KEY ?? "";
}

export interface SearchOptions {
  keyword: string;
  maxResults?: number;
}

/**
 * Search YouTube for BGM videos, returning VideoItem list.
 * Allowed categories: Music (10), Science&Tech (28 excluded), etc.
 * We search with videoCategoryId=10 (Music) by default.
 */
export async function searchVideos(options: SearchOptions): Promise<VideoItem[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("YouTube API key is not set. Please add VITE_YOUTUBE_API_KEY to your .env file.");
  }

  const { keyword, maxResults = 50 } = options;

  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    videoCategoryId: "10", // Music
    videoDuration: "long",  // prefer longer videos (BGM playlists)
    order: "relevance",
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `YouTube API error: ${res.status}`);
  }

  const data = await res.json();
  const items: VideoItem[] = (data.items ?? []).map((item: any) => ({
    id: item.id?.videoId ?? "",
    title: item.snippet?.title ?? "",
    channelId: item.snippet?.channelId ?? "",
    channelTitle: item.snippet?.channelTitle ?? "",
    thumbnail: item.snippet?.thumbnails?.medium?.url ?? "",
    categoryId: "10", // Music (from search filter)
  }));

  const filtered = items.filter((v) => v.id !== "");

  // Shuffle results so the same keyword yields different videos each session
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered;
}

/**
 * Fetch video details (categoryId) for a list of video IDs
 */
export async function fetchVideoDetails(videoIds: string[]): Promise<Record<string, string>> {
  const apiKey = getApiKey();
  if (!apiKey || videoIds.length === 0) return {};

  const params = new URLSearchParams({
    part: "snippet",
    id: videoIds.join(","),
    key: apiKey,
  });

  const res = await fetch(`${API_BASE}/videos?${params}`);
  if (!res.ok) return {};

  const data = await res.json();
  const map: Record<string, string> = {};
  for (const item of data.items ?? []) {
    map[item.id] = item.snippet?.categoryId ?? "";
  }
  return map;
}
