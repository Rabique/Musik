"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Music,
  Sparkles,
  Play,
  Pause,
  Download,
  Share2,
  Sliders,
  Clock,
  Mic,
  Disc3,
  Loader2,
  ListMusic,
  Heart,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface Track {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  duration: string;
  createdAt: string;
  isPlaying?: boolean;
}

const sampleTracks: Track[] = [
  {
    id: "1",
    title: "Midnight Neon Drive",
    prompt: "80s synthwave with analog bassline, retro drum machine, and lush pads",
    genre: "Synthwave",
    duration: "2:45",
    createdAt: "방금 전",
  },
  {
    id: "2",
    title: "Rainy Cafe Lo-fi",
    prompt: "Calm dusty lo-fi hip hop beat with cozy jazz piano chords and vinyl crackle",
    genre: "Lo-fi",
    duration: "2:10",
    createdAt: "2시간 전",
  },
  {
    id: "3",
    title: "Ascent to Aurora",
    prompt: "Epic cinematic orchestral build-up with soaring strings and subtle brass",
    genre: "Cinematic",
    duration: "3:15",
    createdAt: "어제",
  },
];

const styleTags = [
  "Lo-fi Hip-Hop",
  "Synthwave",
  "Cinematic",
  "Ambient Chill",
  "Cyberpunk",
  "Acoustic Pop",
  "Deep House",
  "K-Pop",
  "Neo-Classical",
];

export default function WorkspacePage() {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  const [prompt, setPrompt] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState("Lo-fi Hip-Hop");
  const [isInstrumental, setIsInstrumental] = React.useState(true);
  const [duration, setDuration] = React.useState("60s");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [tracks, setTracks] = React.useState<Track[]>(sampleTracks);
  const [activeTrackId, setActiveTrackId] = React.useState<string | null>(null);

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/auth?next=/workspace");
    }
  }, [user, isAuthLoading, router]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const newTrack: Track = {
        id: Date.now().toString(),
        title: prompt.slice(0, 24) || "Untitled Track",
        prompt: prompt,
        genre: selectedGenre,
        duration: duration,
        createdAt: "방금 전",
      };
      setTracks((prev) => [newTrack, ...prev]);
      setIsGenerating(false);
      setPrompt("");
    }, 1800);
  };

  const togglePlayTrack = (trackId: string) => {
    setActiveTrackId((current) => (current === trackId ? null : trackId));
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
    <div className="min-h-screen w-full bg-[#171717] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Workspace Top Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/70 mb-3">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>AI Music Studio Workspace</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              환영합니다, {displayName}님
            </h1>
            <p className="text-sm text-white/50 mt-1">
              상상하는 멜로디와 분위기를 텍스트로 적어 자신만의 음악을 창작해보세요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md">
              <span className="text-xs text-white/40 block">잔여 생성 크레딧</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Disc3 className="size-4 text-purple-400 animate-spin" style={{ animationDuration: "6s" }} />
                <span className="text-sm font-semibold text-white">50 크레딧</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Creation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: AI Prompt & Generation Panel */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Music className="size-5 text-white/80" />
                  <h2 className="text-lg font-semibold text-white">새 음악 생성</h2>
                </div>
                <span className="text-xs text-white/40">Powered by AI Audio Engine</span>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col gap-5">
                {/* Prompt Textarea */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="예: 빗소리가 섞인 따뜻한 재즈 피아노 선율의 로우파이 비트, 밤 드라이브에 어울리는 감성적인 템포..."
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-white/30">
                    {prompt.length} / 500자
                  </div>
                </div>

                {/* Genre Tags */}
                <div>
                  <label className="text-xs font-medium text-white/60 mb-2 block">
                    장르 / 무드 프리셋
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {styleTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedGenre(tag);
                          if (!prompt.includes(tag)) {
                            setPrompt((prev) => (prev ? `${prev}, ${tag}` : tag));
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selectedGenre === tag
                            ? "border-white/40 bg-white/20 text-white font-medium"
                            : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                  <div>
                    <label className="text-xs font-medium text-white/60 flex items-center gap-1.5 mb-2">
                      <Clock className="size-3.5" />
                      <span>재생 시간</span>
                    </label>
                    <div className="flex gap-2">
                      {["30s", "60s", "120s"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`flex-1 text-xs py-1.5 rounded-xl border transition-all ${
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

                  <div>
                    <label className="text-xs font-medium text-white/60 flex items-center gap-1.5 mb-2">
                      <Mic className="size-3.5" />
                      <span>보컬 옵션</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsInstrumental(!isInstrumental)}
                      className={`w-full text-xs py-2 px-3 rounded-xl border flex items-center justify-between transition-all ${
                        isInstrumental
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-purple-500/30 bg-purple-500/10 text-purple-200"
                      }`}
                    >
                      <span>{isInstrumental ? "연주곡 (Instrumental)" : "보컬 포함"}</span>
                      <Sliders className="size-3.5 text-white/40" />
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-zinc-950" />
                      <span>음악 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 text-amber-500 fill-amber-500" />
                      <span>AI 음악 생성하기</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column: Track Library & Generated History */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ListMusic className="size-5 text-white/80" />
                  <h2 className="text-lg font-semibold text-white">내 트랙 라이브러리</h2>
                </div>
                <span className="text-xs text-white/40">{tracks.length}개 곡</span>
              </div>

              {/* Track list */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
                {tracks.map((track) => {
                  const isPlaying = activeTrackId === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`group relative flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                        isPlaying
                          ? "border-white/30 bg-white/[0.08]"
                          : "border-white/[0.06] bg-black/20 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Play / Pause Button */}
                        <button
                          type="button"
                          onClick={() => togglePlayTrack(track.id)}
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                            isPlaying
                              ? "bg-white text-zinc-900 shadow-md"
                              : "bg-white/10 text-white group-hover:bg-white/20"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="size-4 fill-zinc-900" />
                          ) : (
                            <Play className="size-4 fill-white translate-x-0.5" />
                          )}
                        </button>

                        {/* Track Info */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {track.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-white/60">
                              {track.genre}
                            </span>
                            <span>{track.duration}</span>
                            <span>•</span>
                            <span>{track.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Track Actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="좋아요"
                        >
                          <Heart className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="다운로드"
                        >
                          <Download className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="공유"
                        >
                          <Share2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-auto pt-4 border-t border-white/[0.06]">
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors py-2"
                >
                  <span>홈 랜딩 페이지 둘러보기</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
