"use client";

import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoicePlayer } from "@/hooks/use-voice-player";
import type { BotType } from "@/lib/bot-personalities";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface VoicePlayerButtonProps {
  text: string;
  botType: BotType;
  className?: string;
}

export const VoicePlayerButton = ({
  text,
  botType,
  className,
}: VoicePlayerButtonProps) => {
  const { play, stop, isLoading, isPlaying, isError, error } = useVoicePlayer();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      play(text, botType);
    }
  };

  const getTooltipText = () => {
    if (isLoading) return "Generating voice...";
    if (isPlaying) return "Stop speaking";
    if (isError) return error ?? "Voice error";
    return "Listen to response";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={isPlaying ? "Stop speaking" : "Listen to response"}
            className={className}
            disabled={isLoading}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            size="icon"
            type="button"
            variant="ghost"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : isPlaying ? (
              <VolumeX className="size-4 text-rose-500" />
            ) : (
              <Volume2
                className={`size-4 ${
                  isError ? "text-destructive" : "text-muted-foreground"
                }`}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
