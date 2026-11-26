import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120; // 2 minutes timeout for AI generation

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.Musik_Replicate_token,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      caption,
      lyrics,
      duration = 30,
    } = body;

    if (!caption || typeof caption !== "string" || !caption.trim()) {
      return NextResponse.json(
        { error: "음악 스타일 Caption을 입력해주세요." },
        { status: 400 }
      );
    }

    // Parse duration to seconds (e.g. "30s" -> 30, "60s" -> 60)
    let parsedDuration = 30;
    if (typeof duration === "string") {
      const match = duration.match(/\d+/);
      if (match) parsedDuration = parseInt(match[0], 10);
    } else if (typeof duration === "number") {
      parsedDuration = duration;
    }

    // fishaudio/ace-step-1.5 schema:
    //   caption: music style prompt (genre / instruments / mood)
    //   lyrics:  optional lyrics with [Verse] / [Chorus] tags; omit or "[Instrumental]" for instrumental
    const lyricsParam =
      lyrics && typeof lyrics === "string" && lyrics.trim()
        ? lyrics.trim()
        : "[Instrumental]";

    const input = {
      caption: caption.trim(),
      lyrics: lyricsParam,
      duration: parsedDuration,
      audio_format: "mp3",
      inference_steps: 8,
      shift: 3,
      batch_size: 1,
    };

    console.log("[generate-music] Running Replicate model with input:", input);

    // Call Replicate model: fishaudio/ace-step-1.5
    const output = await replicate.run(
      "fishaudio/ace-step-1.5:74e3a7d383b18815e277de5223f5fe9d53d38832de15aa567fe729fa129d0d85",
      { input }
    );

    console.log("[generate-music] Replicate output received:", output);

    // Extract audio file URL
    let fileUrl = "";
    const firstOutput = Array.isArray(output) ? output[0] : output;
    if (firstOutput && typeof (firstOutput as { url?: () => string | URL }).url === "function") {
      fileUrl = (firstOutput as { url: () => string | URL }).url().toString();
    } else if (firstOutput && typeof (firstOutput as { url?: string }).url === "string") {
      fileUrl = (firstOutput as { url: string }).url;
    } else if (typeof firstOutput === "string") {
      fileUrl = firstOutput;
    } else if (firstOutput) {
      fileUrl = String(firstOutput);
    }

    if (!fileUrl) {
      throw new Error("Replicate에서 생성된 오디오 URL을 가져오지 못했습니다.");
    }

    // Download audio file from Replicate and upload to Supabase Storage "musics"
    const musicId = crypto.randomUUID();
    const fileName = `${user.id}/${musicId}.mp3`;
    let finalAudioUrl = fileUrl;

    try {
      const audioRes = await fetch(fileUrl);
      if (!audioRes.ok) {
        throw new Error(`오디오 다운로드 실패 (상태: ${audioRes.status})`);
      }
      const audioBuffer = await audioRes.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("musics")
        .upload(fileName, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("[generate-music] Supabase storage upload warning:", uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("musics")
          .getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          finalAudioUrl = publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn("[generate-music] Storage upload error, using Replicate URL fallback:", storageErr);
    }

    // Title generation from prompt
    const cleanedPrompt = prompt.trim();
    const title =
      cleanedPrompt.length > 32
        ? `${cleanedPrompt.slice(0, 32)}...`
        : cleanedPrompt;

    // Save record into public.musics table
    const { data: musicRecord, error: dbError } = await supabase
      .from("musics")
      .insert({
        id: musicId,
        user_id: user.id,
        title,
        prompt: cleanedPrompt,
        genre,
        duration: `${parsedDuration}s`,
        audio_url: finalAudioUrl,
        is_instrumental: isInstrumental,
        status: "completed",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[generate-music] Database insert error:", dbError);
      throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      music: musicRecord,
    });
  } catch (error: unknown) {
    console.error("[generate-music] Unexpected error:", error);
    const message =
      error instanceof Error ? error.message : "음악 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
