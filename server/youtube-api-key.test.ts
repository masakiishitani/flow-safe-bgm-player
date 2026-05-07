import { describe, expect, it } from "vitest";
import dotenv from "dotenv";

dotenv.config();

describe("YouTube API Key validation", () => {
  it("VITE_YOUTUBE_API_KEY is set in environment", () => {
    const key = process.env.VITE_YOUTUBE_API_KEY;
    expect(key).toBeTruthy();
    expect(key?.startsWith("AIza")).toBe(true);
  });

  it("YouTube Data API v3 responds with valid key", async () => {
    const key = process.env.VITE_YOUTUBE_API_KEY;
    if (!key) throw new Error("API key not set");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=lofi&type=video&maxResults=1&key=${key}`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  }, 15000);
});
