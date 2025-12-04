"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BotType } from "@/lib/bot-personalities";
import type { ChatMessage } from "@/lib/types";

type AutoSpeakState = "idle" | "loading" | "playing" | "error";

/**
 * Hook that automatically speaks the latest assistant message when streaming completes.
 * Uses ElevenLabs TTS API via the /api/voice endpoint.
 */
export const useAutoSpeak = ({
  messages,
  status,
  botType,
  enabled = true,
}: {
  messages: ChatMessage[];
  status: "ready" | "submitted" | "streaming" | "error";
  botType: BotType;
  enabled?: boolean;
}) => {
  const [state, setState] = useState<AutoSpeakState>("idle");
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(enabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const wasStreamingRef = useRef(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState("idle");
  }, []);

  const speak = useCallback(
    async (text: string, messageBotType: BotType) => {
      stop();

      if (!text.trim()) {
        return;
      }

      setState("loading");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/api/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, botType: messageBotType }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to generate voice");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
          setState("idle");
          URL.revokeObjectURL(audioUrl);
        });

        audio.addEventListener("error", () => {
          setState("error");
          URL.revokeObjectURL(audioUrl);
        });

        setState("playing");
        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setState("idle");
          return;
        }
        setState("error");
      }
    },
    [stop]
  );

  // Track when streaming starts
  useEffect(() => {
    if (status === "streaming") {
      wasStreamingRef.current = true;
    }
  }, [status]);

  // Auto-speak when streaming completes
  useEffect(() => {
    if (!isAutoSpeakEnabled) {
      return;
    }

    // Check if we just finished streaming (was streaming, now ready)
    if (wasStreamingRef.current && status === "ready") {
      wasStreamingRef.current = false;

      // Get the latest assistant message
      const lastMessage = messages.at(-1);
      if (!lastMessage || lastMessage.role !== "assistant") {
        return;
      }

      // Don't speak the same message twice
      if (lastSpokenMessageIdRef.current === lastMessage.id) {
        return;
      }

      // Extract text content from message parts
      const textContent = lastMessage.parts
        ?.filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();

      if (textContent) {
        lastSpokenMessageIdRef.current = lastMessage.id;
        // Use the botType from message metadata if available, otherwise use the current botType
        const messageBotType =
          (lastMessage.metadata?.botType as BotType) ?? botType;
        speak(textContent, messageBotType);
      }
    }
  }, [messages, status, botType, isAutoSpeakEnabled, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const toggleAutoSpeak = useCallback(() => {
    setIsAutoSpeakEnabled((prev) => !prev);
    if (state === "playing" || state === "loading") {
      stop();
    }
  }, [state, stop]);

  return {
    state,
    isAutoSpeakEnabled,
    toggleAutoSpeak,
    stop,
    isLoading: state === "loading",
    isPlaying: state === "playing",
  };
};
