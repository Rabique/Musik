"use client";

import * as React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Repeat1,
  Download,
  X,
  Music,
  Heart,
} from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { LoaderSignalBars } from "@/components/ui/loader-signal-bars";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    togglePlay,
    seek,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleLoop,
    closePlayer,
  } = usePlayer();

  const [isLiked, setIsLiked] = React.useState(false);
  const [isSeeking, setIsSeeking] = React.useState(false);
  const [seekValue, setSeekValue] = React.useState(0);

  // If no track is loaded, don't show player
  if (!currentTrack) return null;

  const currentDisplayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (currentDisplayTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    seek(parseFloat(e.currentTarget.value));
  };

  const handleSeekTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    seek(parseFloat(e.currentTarget.value));
  };

  const handleDownload = () => {
    if (!currentTrack.audio_url) return;
    const a = document.createElement("a");
    a.href = currentTrack.audio_url;
    a.download = `${(currentTrack.title || "musik_track").replace(/[^a-zA-Z0-9가-힣_-]/g, "_")}.mp3`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 select-none bg-[#121212]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.8)] transition-all animate-in slide-in-from-bottom-5 duration-300">
      {/* Top micro progress highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* ================= LEFT COLUMN: Track Info (Spotify style) ================= */}
        <div className="flex items-center gap-3 min-w-0 w-[30%] sm:w-[28%] lg:w-[25%]">
          {/* Cover Art / Icon */}
          <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-700/60 to-indigo-900/80 border border-white/10 flex items-center justify-center shadow-md">
            {currentTrack.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover_url}
                alt={currentTrack.title}
                className="size-full object-cover"
              />
            ) : isPlaying ? (
              <LoaderSignalBars size="sm" variant="equalizer" className="text-white drop-shadow" />
            ) : (
              <Music className="size-5 text-white/70" />
            )}
          </div>

          {/* Track Details */}
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-white/50 truncate mt-0.5">
              {currentTrack.genre || "AI Generated"} • {currentTrack.duration || "30s"}
            </p>
          </div>

          {/* Like / Favorite Button */}
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className="hidden sm:inline-flex p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              className={`size-4 ${
                isLiked ? "fill-purple-500 text-purple-500" : ""
              }`}
            />
          </button>
        </div>

        {/* ================= CENTER COLUMN: Playback Controls & Scrubber ================= */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-[420px] sm:max-w-[480px] md:max-w-[560px]">
          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Loop Toggle Button */}
            <button
              type="button"
              onClick={toggleLoop}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLooping
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-white/40 hover:text-white"
              }`}
              title={isLooping ? "한 곡 반복 사용 중" : "반복 재생"}
            >
              {isLooping ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
            </button>

            {/* Previous Track */}
            <button
              type="button"
              onClick={previousTrack}
              className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="이전 곡"
            >
              <SkipBack className="size-4.5 sm:size-5 fill-current" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <Pause className="size-4.5 sm:size-5 fill-zinc-950" />
              ) : (
                <Play className="size-4.5 sm:size-5 fill-zinc-950 translate-x-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={nextTrack}
              className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="다음 곡"
            >
              <SkipForward className="size-4.5 sm:size-5 fill-current" />
            </button>

            {/* Mobile Download shortcut */}
            <button
              type="button"
              onClick={handleDownload}
              className="sm:hidden p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer"
              title="다운로드"
            >
              <Download className="size-4" />
            </button>
          </div>

          {/* Time Scrubber Row */}
          <div className="flex w-full items-center gap-2 mt-1">
            <span className="w-8 sm:w-10 text-right font-mono text-[11px] text-white/50">
              {formatTime(currentDisplayTime)}
            </span>

            {/* Scrubber slider */}
            <div className="relative flex-1 flex items-center group py-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentDisplayTime}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onTouchEnd={handleSeekTouchEnd}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-purple-400 transition-all focus:outline-none"
              />
            </div>

            <span className="w-8 sm:w-10 text-left font-mono text-[11px] text-white/50">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Volume & Secondary Controls ================= */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-[25%] lg:w-[22%]">
          {/* Volume Icon & Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "음소거 해제" : "음소거"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-4 text-white/40" />
            ) : volume < 0.5 ? (
              <Volume1 className="size-4 text-white/80" />
            ) : (
              <Volume2 className="size-4 text-white/80" />
            )}
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 sm:w-20 md:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-purple-400 transition-all focus:outline-none"
            title={`볼륨: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer ml-1"
            title="음원 다운로드 (.mp3)"
          >
            <Download className="size-4" />
          </button>

          {/* Close Player Button */}
          <button
            type="button"
            onClick={closePlayer}
            className="p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer ml-1"
            title="플레이어 닫기"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BottomPlayer;
