"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Music,
  Sparkles,
  Play,
  Pause,
  Clock,
  Mic,
  Disc3,
  Loader2,
  ListMusic,
  MoreHorizontal,
  Download,
  Trash2,
  Pencil,
  Check,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import { createClient } from "@/lib/supabase/client";
import type { MusicRow } from "@/lib/supabase/types";
import { LoaderSignalBars } from "@/components/ui/loader-signal-bars";

export default function WorkspacePage() {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const supabase = React.useMemo(() => createClient(), []);

  // Form states — caption (music style) + lyrics
  const [caption, setCaption] = React.useState("");
  const [lyrics, setLyrics] = React.useState("");
  const [duration, setDuration] = React.useState("30s");

  // Generation & Status states
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Track library states
  const [tracks, setTracks] = React.useState<MusicRow[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredTracks = tracks.filter((track) =>
    (track.title || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // More options menu state
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  // Rename state: { id, value }
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/auth?next=/workspace");
    }
  }, [user, isAuthLoading, router]);

  // Fetch real tracks from Supabase
  const loadTracks = React.useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingTracks(true);
      const { data, error } = await supabase
        .from("musics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load tracks:", error);
      } else if (data) {
        setTracks(data as MusicRow[]);
      }
    } catch (err) {
      console.error("Error loading tracks:", err);
    } finally {
      setIsLoadingTracks(false);
    }
  }, [user, supabase]);

  React.useEffect(() => {
    if (user) {
      loadTracks();
    }
  }, [user, loadTracks]);

  // Handle generation submission
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      setErrorMessage(null);

      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          lyrics: lyrics.trim() || undefined,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "음악 생성에 실패했습니다.");
      }

      if (data.music) {
        const updated = [data.music, ...tracks];
        setTracks(updated);
        if (data.music.audio_url) {
          playTrack(data.music, updated);
        }
      }

      setCaption("");
      setLyrics("");
    } catch (err: unknown) {
      console.error("Generation error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "음악 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Handler
  const handleDownload = (track: MusicRow) => {
    if (!track.audio_url) return;
    const a = document.createElement("a");
    a.href = track.audio_url;
    a.download = `${(track.title || "musik_track").replace(/[^a-zA-Z0-9가-힣_-]/g, "_")}.mp3`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete Track Handler
  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("이 음악 트랙을 삭제하시겠습니까?")) return;
    setOpenMenuId(null);
    try {
      const { error } = await supabase.from("musics").delete().eq("id", trackId);
      if (error) throw error;
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      console.error("Failed to delete track:", err);
      alert("트랙 삭제에 실패했습니다.");
    }
  };

  // Rename handlers
  const startRename = (track: MusicRow) => {
    setOpenMenuId(null);
    setRenamingId(track.id);
    setRenameValue(track.title || "");
  };

  const commitRename = async (trackId: string) => {
    const newTitle = renameValue.trim();
    if (!newTitle) {
      setRenamingId(null);
      return;
    }
    try {
      const { error } = await supabase
        .from("musics")
        .update({ title: newTitle })
        .eq("id", trackId);
      if (error) throw error;
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, title: newTitle } : t))
      );
    } catch (err) {
      console.error("Failed to rename track:", err);
      alert("이름 변경에 실패했습니다.");
    } finally {
      setRenamingId(null);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#171717] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-white/50" />
          <p className="text-sm text-white/40">워크스페이스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Creator";

  return (
    <div className="min-h-screen w-full bg-[#171717] text-white pt-24 pb-36 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Workspace Top Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/70 mb-3">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>AI Music Studio Workspace (ACE-Step 1.5)</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              환영합니다, {displayName}님
            </h1>
            <p className="text-sm text-white/50 mt-1">
              원하는 분위기와 가사를 입력해 스튜디오 품질의 실제 AI 음원을 생성해보세요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md">
              <span className="text-xs text-white/40 block">생성 엔진</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Disc3 className="size-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">fishaudio/ace-step-1.5</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Creation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: AI Prompt & Generation Panel */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Music className="size-5 text-white/80" />
                  <h2 className="text-lg font-semibold text-white">새 음악 생성</h2>
                </div>
                <span className="text-xs text-purple-400/80 font-mono">Replicate API Connected</span>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col gap-5">
                {/* Caption — Music Style */}
                <div className="relative">
                  <label className="text-xs font-medium text-white/60 mb-1.5 block">
                    음악 스타일 / Caption
                    <span className="ml-2 text-white/30 font-normal">장르·악기·분위기·템포 묘사</span>
                  </label>
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="예: lo-fi hip hop, jazzy piano, chill beats, 80 bpm, rainy night vibes, warm vinyl texture"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-white/30">
                    {caption.length} / 500
                  </div>
                </div>

                {/* Lyrics */}
                <div>
                  <label className="text-xs font-medium text-white/60 flex items-center gap-1.5 mb-1.5">
                    <Mic className="size-3.5" />
                    <span>가사 (선택 사항)</span>
                    <span className="text-[10px] text-white/35 font-normal ml-1">
                      [Verse], [Chorus] 등 구조화 태그 지원 — 비워두면 연주곡으로 생성
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={"[Verse]\n밤하늘에 수놓은 별빛처럼\n[Chorus]\n우리만의 멜로디가 울려퍼져"}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder-white/30 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-medium text-white/60 flex items-center gap-1.5 mb-2">
                    <Clock className="size-3.5" />
                    <span>재생 시간</span>
                  </label>
                  <div className="flex gap-2">
                    {["30s", "60s"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`flex-1 text-xs py-2 rounded-xl border transition-all cursor-pointer ${
                          duration === d
                            ? "border-white/30 bg-white/15 text-white font-semibold"
                            : "border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isGenerating || !caption.trim()}
                  className="mt-1 w-full flex items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-zinc-950" />
                      <span>AI 음악 생성 중 (약 15~30초 소요)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 text-amber-500 fill-amber-500" />
                      <span>AI 음악 생성 시작하기</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column: Track Library */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl flex flex-col h-full min-h-[460px]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ListMusic className="size-5 text-white/80" />
                  <h2 className="text-lg font-semibold text-white">내 트랙 라이브러리</h2>
                </div>
                <span className="text-xs text-white/40">
                  {searchQuery.trim()
                    ? `${filteredTracks.length} / ${tracks.length}개 곡`
                    : `${tracks.length}개 곡`}
                </span>
              </div>

              <label className="relative mb-4 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="제목으로 음악 검색"
                  aria-label="음악 제목 검색"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-white/25"
                />
              </label>

              {/* 음악 생성 중 상태 */}
              {isGenerating && (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs text-purple-200 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <LoaderSignalBars size="sm" variant="equalizer" className="text-purple-400" />
                    <span className="font-medium">음악 생성 중...</span>
                  </div>
                  <span className="text-[11px] text-purple-300/60 font-mono">ACE-Step 1.5</span>
                </div>
              )}

              {/* 에러 상태 */}
              {errorMessage && (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200 backdrop-blur-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="size-3.5 shrink-0 text-rose-400"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span className="truncate">{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="ml-2 text-[11px] text-rose-300/60 hover:text-rose-200 shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Track list */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1 flex-1" ref={menuRef}>
                {isLoadingTracks ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-xs">라이브러리 불러오는 중...</span>
                  </div>
                ) : tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <div className="size-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
                      <Music className="size-5 text-white/40" />
                    </div>
                    <p className="text-sm font-medium text-white/70">아직 생성된 곡이 없습니다</p>
                    <p className="text-xs text-white/40 mt-1 max-w-xs">
                      왼쪽 입력창에서 원하는 분위기의 Caption을 작성하고 첫 음악을 생성해보세요!
                    </p>
                  </div>
                ) : filteredTracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Search className="mb-3 size-6 text-white/35" />
                    <p className="text-sm font-medium text-white/70">검색 결과가 없습니다</p>
                    <p className="mt-1 text-xs text-white/40">
                      다른 제목으로 검색해보세요.
                    </p>
                  </div>
                ) : (
                  filteredTracks.map((track) => {
                    const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                    const isMenuOpen = openMenuId === track.id;
                    const isRenaming = renamingId === track.id;

                    return (
                      <div
                        key={track.id}
                        className={`group relative flex flex-col rounded-2xl border p-3.5 transition-all ${
                          currentTrack?.id === track.id
                            ? "border-purple-500/40 bg-white/[0.06] shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                            : "border-white/[0.06] bg-black/20 hover:border-white/15 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Play / Pause Button */}
                            <button
                              type="button"
                              onClick={() =>
                                currentTrack?.id === track.id
                                  ? togglePlay()
                                  : playTrack(track, tracks)
                              }
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                                isCurrentPlaying
                                  ? "bg-white text-zinc-950 shadow-md"
                                  : "bg-white/10 text-white hover:bg-white/20"
                              }`}
                              title={isCurrentPlaying ? "일시정지" : "재생"}
                            >
                              {isCurrentPlaying ? (
                                <Pause className="size-4 fill-zinc-950" />
                              ) : (
                                <Play className="size-4 fill-white translate-x-0.5" />
                              )}
                            </button>

                            {/* Track Info / Rename inline */}
                            <div className="min-w-0 flex-1">
                              {isRenaming ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    autoFocus
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") commitRename(track.id);
                                      if (e.key === "Escape") setRenamingId(null);
                                    }}
                                    className="flex-1 min-w-0 rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-white focus:border-white/40 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => commitRename(track.id)}
                                    className="p-1 text-green-400 hover:text-green-300 cursor-pointer"
                                  >
                                    <Check className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRenamingId(null)}
                                    className="p-1 text-white/40 hover:text-white/70 cursor-pointer"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-white truncate max-w-[180px]">
                                    {track.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                                    {track.genre && (
                                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-white/60">
                                        {track.genre}
                                      </span>
                                    )}
                                    <span>{track.duration || "30s"}</span>
                                    <span>•</span>
                                    <span>
                                      {new Date(track.created_at).toLocaleDateString("ko-KR", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* ⋯ More Options Button */}
                          {!isRenaming && (
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(isMenuOpen ? null : track.id);
                                }}
                                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="더 보기"
                              >
                                <MoreHorizontal className="size-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-white/10 bg-zinc-900 shadow-xl py-1 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => startRename(track)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Pencil className="size-3.5 text-white/50" />
                                    이름 변경
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleDownload(track);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Download className="size-3.5 text-white/50" />
                                    다운로드
                                  </button>
                                  <div className="border-t border-white/[0.06] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTrack(track.id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                    삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
