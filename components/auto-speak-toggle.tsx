"use client";

import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface AutoSpeakToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  onStop: () => void;
  className?: string;
}

export const AutoSpeakToggle = ({
  isEnabled,
  isLoading,
  isPlaying,
  onToggle,
  onStop,
  className,
}: AutoSpeakToggleProps) => {
  const handleClick = () => {
    if (isPlaying || isLoading) {
      onStop();
    } else {
      onToggle();
    }
  };

  const getTooltipText = () => {
    if (isLoading) return "Generating voice...";
    if (isPlaying) return "Stop speaking";
    if (isEnabled) return "Auto-speak on (click to disable)";
    return "Auto-speak off (click to enable)";
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
            aria-label={isPlaying ? "Stop speaking" : isEnabled ? "Disable auto-speak" : "Enable auto-speak"}
            className={className}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            size="icon"
            type="button"
            variant="ghost"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-rose-500" />
            ) : isPlaying ? (
              <VolumeX className="size-4 text-rose-500" />
            ) : isEnabled ? (
              <Volume2 className="size-4 text-rose-500" />
            ) : (
              <Volume2 className="size-4 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" side="top">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
