"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Music, ArrowLeft, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
            />
        </svg>
    );
}

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, signInWithGoogle, isLoading: isAuthLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isAuthLoading && user) {
            router.replace("/");
        }
    }, [user, isAuthLoading, router]);

    React.useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            setErrorMessage(
                errorParam === "auth_failed"
                    ? "인증 처리에 실패했습니다. 다시 시도해 주세요."
                    : decodeURIComponent(errorParam)
            );
        }
    }, [searchParams]);

    const handleGoogleLogin = async () => {
        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            const { error } = await signInWithGoogle();
            if (error) {
                setErrorMessage(error.message);
                setIsSubmitting(false);
            }
        } catch (err: unknown) {
            setErrorMessage(
                err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다."
            );
            setIsSubmitting(false);
        }
    };

    const isButtonLoading = isAuthLoading || isSubmitting;

    return (
        <div className="relative min-h-screen w-full bg-[#171717] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Liquid Ambient Light Orbs */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                {/* Soft violet fluid glow */}
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/15 blur-[120px] animate-pulse duration-1000" />
                {/* Amber twilight fluid glow */}
                <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[140px]" />
                {/* Deep cyan subtle puddle */}
                <div className="absolute -bottom-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[130px]" />

                {/* Liquid reflection grid / noise mask */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            {/* Top Navigation Back Link */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md"
                >
                    <ArrowLeft className="size-4" />
                    <span>Home</span>
                </Link>
            </div>

            {/* Liquid Glass Auth Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Outer Glow Halo */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-40 blur-xl pointer-events-none" />

                {/* Main Liquid Glass Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-8 sm:p-10 backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)]">
                    {/* Internal Specular Glass Highlight Effect */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.12] to-transparent" />
                    <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                    {/* Header & Logo */}
                    <div className="relative flex flex-col items-center text-center">
                        {/* Liquid Glass Logo Icon */}
                        <div className="relative mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl">
                            <Music className="size-7 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
                            <div className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-400/80 ring-2 ring-[#171717]">
                                <Sparkles className="size-2.5 text-black" />
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                            Welcome to Musik
                        </h1>

                    </div>

                    {/* Single Google Auth Action */}
                    <div className="relative mt-8 flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isButtonLoading}
                            className="group relative flex w-full items-center justify-center gap-3.5 rounded-2xl bg-white/95 px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isButtonLoading ? (
                                <Loader2 className="size-5 animate-spin text-zinc-900" />
                            ) : (
                                <GoogleIcon className="transition-transform group-hover:scale-110 duration-200" />
                            )}
                            <span>{isButtonLoading ? "Connecting..." : "Continue with Google"}</span>
                        </button>

                        {errorMessage && (
                            <p className="text-xs text-rose-400 text-center">{errorMessage}</p>
                        )}

                        {/* Subtle Security Badge */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/40">
                            <ShieldCheck className="size-3.5 text-white/50" />
                            <span>별도 가입 절차 없이 즉시 시작됩니다</span>
                        </div>
                    </div>

                    {/* Footer Terms */}
                    <div className="relative mt-8 pt-6 border-t border-white/[0.08] text-center">
                        <p className="text-[11px] leading-relaxed text-white/40">
                            계속 진행함으로써 Musik의{" "}
                            <Link
                                href="#terms"
                                className="underline underline-offset-2 text-white/60 hover:text-white transition-colors"
                            >
                                이용약관
                            </Link>{" "}
                            및{" "}
                            <Link
                                href="#privacy"
                                className="underline underline-offset-2 text-white/60 hover:text-white transition-colors"
                            >
                                개인정보처리방침
                            </Link>
                            에 동의하게 됩니다.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <React.Suspense
            fallback={
                <div className="min-h-screen w-full bg-[#171717] flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-white/50" />
                </div>
            }
        >
            <AuthContent />
        </React.Suspense>
    );
}
