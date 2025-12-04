import { auth } from "@/app/(auth)/auth";
import { getVoiceConfig, MAX_TTS_TEXT_LENGTH } from "@/lib/ai/voice-config";
import type { BotType } from "@/lib/bot-personalities";
import { ChatSDKError } from "@/lib/errors";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const { text, botType } = (await request.json()) as {
      text: string;
      botType: BotType;
    };

    if (!text || typeof text !== "string") {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    // Validate botType
    if (!["alexandria", "kim", "collaborative"].includes(botType)) {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    // Truncate text if too long
    const truncatedText = text.slice(0, MAX_TTS_TEXT_LENGTH);

    // Strip markdown formatting for cleaner speech
    const cleanText = stripMarkdown(truncatedText);

    if (!cleanText.trim()) {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Voice service not configured" },
        { status: 503 }
      );
    }

    const voiceConfig = getVoiceConfig(botType);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: voiceConfig.modelId,
          voice_settings: {
            stability: voiceConfig.settings.stability,
            similarity_boost: voiceConfig.settings.similarityBoost,
            style: voiceConfig.settings.style ?? 0,
            use_speaker_boost: voiceConfig.settings.useSpeakerBoost ?? true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      return Response.json(
        { error: "Voice generation failed" },
        { status: response.status }
      );
    }

    // Stream the audio response
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Voice API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to strip markdown for cleaner TTS
function stripMarkdown(text: string): string {
  return (
    text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove horizontal rules
      .replace(/^---+$/gm, "")
      // Remove table formatting
      .replace(/\|/g, "")
      .replace(/^[-:]+$/gm, "")
      // Clean up multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
