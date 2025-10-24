"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { memo } from "react";
import type { BotType } from "@/lib/bot-personalities";
import { BOT_PERSONALITIES } from "@/lib/bot-personalities";
import { cn } from "@/lib/utils";
import { Response } from "./elements/response";

type EnhancedChatMessageProps = {
  role: string;
  content?: string | null;
  botType: BotType;
  isTyping?: boolean;
};

const TypingIndicator = () => (
  <span className="animate-pulse font-medium text-muted-foreground text-xs">
    Thinking...
  </span>
);

export const EnhancedChatMessage = memo(
  ({ role, content, botType, isTyping }: EnhancedChatMessageProps) => {
    const safeContent = content?.trim() ? content : "";

    if (role !== "assistant") {
      return (
        <div className="ml-auto max-w-prose rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-sm text-white shadow-lg shadow-rose-200/40">
          {safeContent ? <Response>{safeContent}</Response> : null}
          {!safeContent && isTyping ? <TypingIndicator /> : null}
        </div>
      );
    }

    const personality =
      BOT_PERSONALITIES[botType] ?? BOT_PERSONALITIES.alexandria;

    return (
      <div className="relative flex w-full gap-2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-3 text-xs shadow-rose-200/30 shadow-xl backdrop-blur transition-all duration-300 hover:shadow-2xl hover:shadow-rose-300/40 sm:gap-3 sm:rounded-[24px] sm:p-4 sm:text-sm lg:gap-4 lg:rounded-[28px] lg:p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-transparent to-amber-100/30" />

        {/* Avatar */}
        {personality.avatar && (
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="relative size-8 flex-shrink-0 sm:size-10 lg:size-12"
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Image
              alt={`${personality.name} avatar`}
              className="rounded-full border-2 border-white shadow-lg ring-1 ring-rose-100/50 sm:ring-2"
              height={48}
              sizes="(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px"
              src={personality.avatar}
              width={48}
            />
          </motion.div>
        )}

        <div className="relative flex flex-1 flex-col gap-2 sm:gap-2.5 lg:gap-3">
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3"
            initial={{ y: -10, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <motion.span
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 font-semibold text-[9px] text-white uppercase tracking-[0.15em] shadow-rose-200/50 shadow-sm sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.2em] lg:gap-2 lg:px-4 lg:text-[11px]",
                personality.color
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {personality.name}
            </motion.span>
            <motion.span
              className="rounded-full bg-rose-50/80 px-2 py-0.5 font-semibold text-[9px] text-rose-600 uppercase tracking-wide shadow-rose-100/40 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-3 lg:text-[11px]"
              whileHover={{ scale: 1.05 }}
            >
              {personality.role}
            </motion.span>
          </motion.div>

          <motion.div
            animate={{ opacity: 1 }}
            className="relative text-slate-700 text-sm leading-relaxed sm:text-[0.95rem] lg:text-base"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {safeContent ? <Response>{safeContent}</Response> : null}
            {!safeContent && isTyping ? <TypingIndicator /> : null}
          </motion.div>
        </div>
      </div>
    );
  },
  (previous, next) =>
    previous.role === next.role &&
    previous.content === next.content &&
    previous.botType === next.botType &&
    previous.isTyping === next.isTyping
);

EnhancedChatMessage.displayName = "EnhancedChatMessage";
