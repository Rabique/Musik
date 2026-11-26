"use client";

import * as React from "react";
import type { MusicRow } from "@/lib/supabase/types";

interface PlayerContextType {
  currentTrack: MusicRow | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  playlist: MusicRow[];
  playTrack: (track: MusicRow, newPlaylist?: MusicRow[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  closePlayer: () => void;
}

const PlayerContext = React.createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = React.useState<MusicRow | null>(null);
  const [playlist, setPlaylist] = React.useState<MusicRow[]>([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolumeState] = React.useState(0.85);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = React.useRef(0.85);

  // Initialize audio element
  React.useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        // Play next track automatically if available
        nextTrack();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audioRef.current = null;
    };
  }, [isLooping]);

  // Keep audio volume in sync
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = React.useCallback(
    (track: MusicRow, newPlaylist?: MusicRow[]) => {
      if (!track.audio_url) return;

      if (newPlaylist && newPlaylist.length > 0) {
        setPlaylist(newPlaylist);
      }

      if (currentTrack?.id === track.id && audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(console.error);
        }
        return;
      }

      setCurrentTrack(track);
      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play().catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        });
      }
    },
    [currentTrack?.id, isPlaying]
  );

  const togglePlay = React.useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, currentTrack]);

  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = React.useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  const seek = React.useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const nextTrack = React.useCallback(() => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextItem = playlist[nextIndex];
    if (nextItem) {
      playTrack(nextItem, playlist);
    }
  }, [playlist, currentTrack, playTrack]);

  const previousTrack = React.useCallback(() => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;

    // If more than 3 seconds in, restart track like Spotify
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevItem = playlist[prevIndex];
    if (prevItem) {
      playTrack(prevItem, playlist);
    }
  }, [playlist, currentTrack, playTrack]);

  const setVolume = React.useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        previousVolumeRef.current = volume;
        return true;
      } else {
        if (volume === 0) setVolumeState(previousVolumeRef.current || 0.5);
        return false;
      }
    });
  }, [volume]);

  const toggleLoop = React.useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const closePlayer = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const value = React.useMemo(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isLooping,
      playlist,
      playTrack,
      togglePlay,
      pause,
      resume,
      seek,
      nextTrack,
      previousTrack,
      setVolume,
      toggleMute,
      toggleLoop,
      closePlayer,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isLooping,
      playlist,
      playTrack,
      togglePlay,
      pause,
      resume,
      seek,
      nextTrack,
      previousTrack,
      setVolume,
      toggleMute,
      toggleLoop,
      closePlayer,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = React.useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
