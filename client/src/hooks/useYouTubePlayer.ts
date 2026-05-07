/**
 * Flow-Safe BGM Player — YouTube IFrame Player hook
 * Wraps the YT.Player API loaded via <script> in index.html
 */

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type YTPlayer = any;

declare global {
  interface Window {
    YT: {
      Player: new (el: string | HTMLElement, opts: any) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerState = "unstarted" | "playing" | "paused" | "buffering" | "ended" | "cued";

interface UseYouTubePlayerReturn {
  isReady: boolean;
  playerState: PlayerState;
  volume: number;
  loadVideo: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
}

export const CONTAINER_ID = "yt-player-container";

export function useYouTubePlayer(
  onVideoEnded: () => void
): UseYouTubePlayerReturn {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>("unstarted");
  const [volume, setVolumeState] = useState(80);
  const onVideoEndedRef = useRef(onVideoEnded);
  onVideoEndedRef.current = onVideoEnded;
  // Track whether we've attempted to init (to avoid double-init)
  const initAttemptedRef = useRef(false);

  const initPlayer = useCallback(() => {
    // Ensure the container exists in DOM before creating the player
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      // Container not in DOM yet — will retry when it mounts
      return;
    }
    if (playerRef.current) return;
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    playerRef.current = new window.YT.Player(CONTAINER_ID, {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(80);
          setIsReady(true);
        },
        onStateChange: (e: any) => {
          const s = e.data;
          const YT = window.YT;
          if (s === YT.PlayerState.PLAYING) setPlayerState("playing");
          else if (s === YT.PlayerState.PAUSED) setPlayerState("paused");
          else if (s === YT.PlayerState.BUFFERING) setPlayerState("buffering");
          else if (s === YT.PlayerState.ENDED) {
            setPlayerState("ended");
            onVideoEndedRef.current();
          } else if (s === YT.PlayerState.CUED) setPlayerState("cued");
          else setPlayerState("unstarted");
        },
      },
    });
  }, []);

  useEffect(() => {
    // Register the global callback so it fires when YT API script loads
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      initPlayer();
    };

    // If YT is already loaded, try to init immediately
    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      initAttemptedRef.current = false;
      setIsReady(false);
    };
  }, [initPlayer]);

  const loadVideo = useCallback((videoId: string) => {
    if (!playerRef.current) return;
    playerRef.current.loadVideoById(videoId);
  }, []);

  const playVideo = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pauseVideo = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    playerRef.current?.setVolume(clamped);
    setVolumeState(clamped);
  }, []);

  const getVolume = useCallback((): number => {
    return playerRef.current?.getVolume() ?? volume;
  }, [volume]);

  return { isReady, playerState, volume, loadVideo, playVideo, pauseVideo, setVolume, getVolume };
}
