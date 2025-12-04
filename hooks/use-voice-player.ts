"use client";

import { useCallback, useRef, useState } from "react";
import type { BotType } from "@/lib/bot-personalities";

export type VoicePlayerState = "idle" | "loading" | "playing" | "error";

export const useVoicePlayer = () => {
  const [state, setState] = useState<VoicePlayerState>("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    setError(null);
  }, []);

  const play = useCallback(
    async (text: string, botType: BotType) => {
      // Stop any currently playing audio
      stop();

      if (!text.trim()) {
        setError("No text to speak");
        setState("error");
        return;
      }

      setState("loading");
      setError(null);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/api/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, botType }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Failed to generate voice");
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
          setError("Failed to play audio");
          URL.revokeObjectURL(audioUrl);
        });

        setState("playing");
        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setState("idle");
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setState("error");
      }
    },
    [stop]
  );

  return {
    state,
    error,
    play,
    stop,
    isLoading: state === "loading",
    isPlaying: state === "playing",
    isError: state === "error",
  };
};
