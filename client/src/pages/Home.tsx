/**
 * Flow-Safe BGM Player — Main Page
 * Design: "Deep Work Studio" — Manus Brand Compliant
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ThumbsUp, ThumbsDown, Play, Pause, Volume2, VolumeX, Settings, Download, Upload, Music2 } from "lucide-react";
import { toast } from "sonner";
import { CONTAINER_ID, useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useTimer } from "@/hooks/useTimer";
import { searchVideos } from "@/lib/youtube";
import { filterVideos, sortByWhitelist, VideoItem } from "@/lib/filter";
import { blacklist, exportData, importData, searchKeyword, volumeStore, whitelist } from "@/lib/storage";

type AppState = "idle" | "loading" | "playing" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [keyword, setKeyword] = useState(searchKeyword.get());
  const [keywordInput, setKeywordInput] = useState(searchKeyword.get());
  const [playlist, setPlaylist] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [blurPlayer, setBlurPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [vol, setVol] = useState(volumeStore.get());
  const importRef = useRef<HTMLInputElement>(null);

  // ── YouTube Player ──────────────────────────────────────────────────────
  const handleVideoEnded = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const { isReady, playerState, loadVideo, playVideo, pauseVideo, setVolume } =
    useYouTubePlayer(handleVideoEnded);

  // ── Timer ───────────────────────────────────────────────────────────────
  const handleFadeStep = useCallback(
    (v: number) => {
      setVolume(v);
      setVol(v);
    },
    [setVolume]
  );

  const { phase: timerPhase, elapsedMinutes, start: startTimer, stop: stopTimer, reset: resetTimer } =
    useTimer({ onFadeStep: handleFadeStep, initialVolume: vol });

  // ── Fetch & filter playlist ─────────────────────────────────────────────
  const fetchPlaylist = useCallback(async (kw: string) => {
    setAppState("loading");
    setErrorMsg("");
    try {
      const videos = await searchVideos({ keyword: kw, maxResults: 25 });
      const filtered = filterVideos(videos, blacklist.getChannels(), blacklist.getVideos());
      const sorted = sortByWhitelist(filtered, whitelist.getChannels());
      if (sorted.length === 0) {
        setErrorMsg("再生できる動画が見つかりませんでした。キーワードを変えてみてください。");
        setAppState("error");
        return;
      }
      setPlaylist(sorted);
      setCurrentIndex(0);
      setAppState("playing");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "エラーが発生しました。";
      setErrorMsg(msg);
      setAppState("error");
    }
  }, []);

  // ── Load video when index changes ───────────────────────────────────────
  useEffect(() => {
    if (playlist.length === 0 || appState !== "playing") return;
    if (currentIndex >= playlist.length) {
      fetchPlaylist(keyword);
      return;
    }
    const video = playlist[currentIndex];
    setCurrentVideo(video);
    if (isReady) loadVideo(video.id);
  }, [currentIndex, playlist, isReady, appState, keyword, fetchPlaylist, loadVideo]);

  // ── Start timer when first video plays ─────────────────────────────────
  useEffect(() => {
    if (playerState === "playing" && timerPhase === "idle") {
      startTimer();
    }
  }, [playerState, timerPhase, startTimer]);

  // ── Volume sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isReady) setVolume(vol);
  }, [isReady, vol, setVolume]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleStart = () => {
    const kw = keywordInput.trim() || "lofi hip hop study";
    setKeyword(kw);
    searchKeyword.set(kw);
    fetchPlaylist(kw);
  };

  const handleGood = () => {
    if (!currentVideo) return;
    whitelist.addChannel(currentVideo.channelId);
    toast.success(`「${currentVideo.channelTitle}」をお気に入りに追加しました`);
  };

  const handleBad = () => {
    if (!currentVideo) return;
    blacklist.addChannel(currentVideo.channelId);
    blacklist.addVideo(currentVideo.id);
    toast(`「${currentVideo.channelTitle}」をブロックしました`);
    setCurrentIndex((i) => i + 1);
  };

  const handlePlayPause = () => {
    if (playerState === "playing") {
      pauseVideo();
      stopTimer();
    } else {
      playVideo();
      if (timerPhase === "idle") startTimer();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    setVol(v);
    setVolume(v);
    volumeStore.set(v);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowsafe-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("設定をエクスポートしました");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importData(text)) {
        toast.success("設定をインポートしました");
        setKeywordInput(searchKeyword.get());
        setKeyword(searchKeyword.get());
      } else {
        toast.error("インポートに失敗しました");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleStop = () => {
    pauseVideo();
    stopTimer();
    resetTimer();
    setAppState("idle");
    setPlaylist([]);
    setCurrentVideo(null);
    setCurrentIndex(0);
  };

  // ── Elapsed display ─────────────────────────────────────────────────────
  const elapsedLabel = (() => {
    if (timerPhase === "idle") return "";
    if (timerPhase === "done") return "セッション終了";
    if (timerPhase === "fading") return `${elapsedMinutes}分経過 — フェードアウト中`;
    return `${elapsedMinutes}分経過`;
  })();

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#34322D", color: "#FFFFFF" }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Music2 size={18} style={{ opacity: 0.7 }} />
          <span className="text-sm font-medium tracking-wide" style={{ opacity: 0.85 }}>
            Flow-Safe BGM
          </span>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="p-1.5 rounded transition-opacity hover:opacity-100"
          style={{ opacity: 0.5 }}
          title="設定"
        >
          <Settings size={16} />
        </button>
      </header>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div
          className="border-b px-4 py-3 text-sm space-y-3"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        >
          <p className="font-medium" style={{ opacity: 0.7 }}>設定</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Download size={12} /> 設定をエクスポート
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Upload size={12} /> 設定をインポート
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          <div className="flex items-center gap-3">
            <Volume2 size={14} style={{ opacity: 0.6 }} />
            <input
              type="range" min={0} max={100} value={vol}
              onChange={handleVolumeChange}
              className="w-32 accent-white"
            />
            <span style={{ opacity: 0.5 }}>{vol}</span>
            {vol === 0 && <VolumeX size={14} style={{ opacity: 0.5 }} />}
          </div>
          <div className="text-xs" style={{ opacity: 0.45 }}>
            お気に入りチャンネル: {whitelist.getChannels().length}件 ／
            ブロック: {blacklist.getChannels().length}チャンネル・{blacklist.getVideos().length}動画
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-6 w-full max-w-2xl mx-auto">

        {/* ── Search / Start ── */}
        {appState === "idle" && (
          <div className="w-full flex flex-col gap-4 mt-8">
            <h1 className="text-xl font-semibold text-center tracking-tight" style={{ opacity: 0.9 }}>
              集中作業用 BGM を始める
            </h1>
            <p className="text-sm text-center" style={{ opacity: 0.45 }}>
              キーワードを入力して再生を開始してください
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="例: lofi hip hop, ambient study, jazz bgm"
                className="flex-1 px-3 py-2 rounded text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              />
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                再生開始
              </button>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {appState === "loading" && (
          <div className="flex flex-col items-center gap-3 mt-16" style={{ opacity: 0.6 }}>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">動画を検索中...</p>
          </div>
        )}

        {/* ── Error ── */}
        {appState === "error" && (
          <div className="w-full mt-8 flex flex-col gap-4">
            <div
              className="px-4 py-3 rounded text-sm"
              style={{
                backgroundColor: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.3)",
                color: "#f9a8d4",
              }}
            >
              {errorMsg}
            </div>
            <button onClick={() => setAppState("idle")} className="text-sm underline" style={{ opacity: 0.6 }}>
              戻る
            </button>
          </div>
        )}

        {/* ── Player ── */}
        {appState === "playing" && (
          <div className="w-full flex flex-col gap-4 fade-in">

            {/* Video player */}
            <div
              className="rounded overflow-hidden w-full"
              style={{
                boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                id={CONTAINER_ID}
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  filter: blurPlayer ? "blur(12px) brightness(0.4)" : "none",
                  transition: "filter 0.4s ease",
                }}
              />
            </div>

            {/* Track info */}
            {currentVideo && (
              <div className="flex items-start justify-between gap-2 px-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ opacity: 0.9 }}>
                    {currentVideo.title}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ opacity: 0.45 }}>
                    {currentVideo.channelTitle}
                  </p>
                </div>
                <button
                  onClick={() => setBlurPlayer((b) => !b)}
                  className="text-xs px-2 py-1 rounded shrink-0 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", opacity: 0.7 }}
                  title="映像をぼかす"
                >
                  {blurPlayer ? "映像を表示" : "映像をぼかす"}
                </button>
              </div>
            )}

            {/* Controls: Play/Pause + Good/Bad */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                title={playerState === "playing" ? "一時停止" : "再生"}
              >
                {playerState === "playing" ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Good button */}
              <button
                onClick={handleGood}
                className="btn-good flex items-center gap-2 px-6 py-3 rounded font-medium text-sm"
                title="このチャンネルをお気に入りに追加"
              >
                <ThumbsUp size={16} />
                Good
              </button>

              {/* Bad button (pink warning) */}
              <button
                onClick={handleBad}
                className="btn-bad flex items-center gap-2 px-6 py-3 rounded font-medium text-sm"
                title="このチャンネルをブロックしてスキップ"
              >
                <ThumbsDown size={16} />
                Bad
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center justify-center gap-3 px-2">
              <VolumeX size={14} style={{ opacity: 0.4 }} />
              <input
                type="range" min={0} max={100} value={vol}
                onChange={handleVolumeChange}
                className="w-40 accent-white"
              />
              <Volume2 size={14} style={{ opacity: 0.4 }} />
              <span className="text-xs w-6 text-right" style={{ opacity: 0.4 }}>{vol}</span>
            </div>

            {/* Stop session */}
            <div className="flex justify-center">
              <button onClick={handleStop} className="text-xs underline" style={{ opacity: 0.35 }}>
                セッションを終了
              </button>
            </div>
          </div>
        )}

        {/* ── Fade-out done message ── */}
        {timerPhase === "done" && (
          <div
            className="w-full mt-4 px-4 py-3 rounded text-sm text-center fade-in"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            2時間のセッションが完了しました。お疲れさまでした。
          </div>
        )}
      </main>

      {/* ── Footer: Passive Timer ── */}
      {elapsedLabel && (
        <div
          className="fixed bottom-3 right-4 text-xs pointer-events-none select-none"
          style={{ opacity: 0.3, fontVariantNumeric: "tabular-nums" }}
        >
          {elapsedLabel}
        </div>
      )}
    </div>
  );
}
