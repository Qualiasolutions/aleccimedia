"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles, UserRound, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BOT_PERSONALITIES, type BotType } from "@/lib/bot-personalities";
import { cn } from "@/lib/utils";

interface ExecutiveSwitchProps {
  selectedExecutive: BotType;
  onExecutiveChange: (executive: BotType) => void;
  disabled?: boolean;
}

export function ExecutiveSwitch({
  selectedExecutive,
  onExecutiveChange,
  disabled = false,
}: ExecutiveSwitchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleExecutiveSelect = (executive: BotType) => {
    onExecutiveChange(executive);
    setIsOpen(false);
  };

  const selectedPersonality = BOT_PERSONALITIES[selectedExecutive];
  const otherExecutives = Object.entries(BOT_PERSONALITIES).filter(
    ([key]) => key !== selectedExecutive
  );

  const getExecutiveIcon = (
    executive: BotType,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const personality = BOT_PERSONALITIES[executive];
    const sizeClasses = {
      sm: "size-6",
      md: "size-10",
      lg: "size-16",
    };
    const iconSizes = {
      sm: "h-3 w-3",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const iconClass = cn(
      "overflow-hidden rounded-full border-2 border-white/50 shadow-lg transition-all duration-300",
      sizeClasses[size]
    );

    // If avatar exists, use it
    if (personality.avatar) {
      return (
        <motion.div
          className={iconClass}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            alt={`${personality.name} avatar`}
            className="size-full object-cover"
            height={size === "sm" ? 24 : size === "md" ? 40 : 64}
            src={personality.avatar}
            width={size === "sm" ? 24 : size === "md" ? 40 : 64}
          />
        </motion.div>
      );
    }

    // Fallback to icons if no avatar
    switch (personality.icon) {
      case "Crown":
        return (
          <motion.div
            className={cn(
              iconClass,
              "flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600 text-white"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className={iconSizes[size]} />
          </motion.div>
        );
      case "UserRound":
        return (
          <motion.div
            className={cn(
              iconClass,
              "flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 text-white"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserRound className={iconSizes[size]} />
          </motion.div>
        );
      case "Users":
        return (
          <motion.div
            className={cn(
              iconClass,
              "flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-700 text-white"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className={iconSizes[size]} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            className={cn(
              iconClass,
              "flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 text-white"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserRound className={iconSizes[size]} />
          </motion.div>
        );
    }
  };

  return (
    <div className="relative h-full">
      <Button
        className={cn(
          "group relative flex h-full w-full items-center justify-between gap-1 rounded-lg border border-white/20 bg-gradient-to-r from-white/90 to-white/80 px-1.5 py-1 text-left shadow-rose-200/20 shadow-xl backdrop-blur-md transition-all duration-300 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 lg:gap-3 lg:px-4 lg:py-2.5",
          "hover:-translate-y-0.5 hover:border-white/30 hover:shadow-2xl hover:shadow-rose-200/30",
          "focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-white/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm" />

        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400/20 via-purple-400/20 to-indigo-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex w-full items-center gap-0.5 sm:gap-2 lg:gap-3">
          <motion.div
            animate={{ scale: 1, rotate: 0 }}
            className="flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            key={selectedExecutive}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {getExecutiveIcon(selectedExecutive, "sm")}
          </motion.div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center">
              <span className="truncate font-bold text-[9px] text-slate-800 leading-tight sm:text-xs">
                {selectedPersonality.name.split(" ")[0]}
              </span>
            </div>
            <span className="hidden truncate font-medium text-[8px] text-slate-500 leading-tight sm:block sm:text-[10px]">
              {selectedPersonality.role.split("(")[0].trim()}
            </span>
          </div>

          <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1.5 lg:gap-2">
            <Badge
              className="hidden border-0 bg-gradient-to-r from-rose-500 to-rose-600 px-1 py-0.5 font-semibold text-[8px] text-white shadow-lg md:inline-flex md:px-2 md:text-[9px]"
              variant="secondary"
            >
              Active
            </Badge>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="text-slate-500"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <svg
                className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </Button>

      {/* Professional Modal Popup */}
      {mounted &&
        isOpen &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999]">
              {/* Modal Backdrop */}
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                transition={{ duration: 0.3 }}
              />

              {/* Modal Content */}
              <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative w-full max-w-4xl"
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {/* Modal Card */}
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/98 via-white/95 to-white/98 shadow-2xl shadow-rose-300/50 backdrop-blur-xl">
                    {/* Modal Header */}
                    <div className="relative border-white/20 border-b bg-gradient-to-r from-rose-100/80 via-purple-100/80 to-indigo-100/80 px-8 py-8">
                      {/* Decorative Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 via-purple-400/10 to-indigo-400/10" />
                      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-rose-200/30 to-transparent blur-3xl" />
                      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-indigo-200/30 to-transparent blur-3xl" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <motion.div
                                animate={{ rotate: 360 }}
                                className="relative"
                                transition={{
                                  duration: 20,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                              >
                                <Sparkles className="h-8 w-8 text-rose-500" />
                                <div className="absolute inset-0 animate-pulse">
                                  <div className="h-8 w-8 rounded-full bg-rose-400/30 blur-xl" />
                                </div>
                              </motion.div>
                            </div>
                            <div>
                              <h1 className="bg-gradient-to-r from-rose-700 via-purple-700 to-indigo-700 bg-clip-text font-bold text-3xl text-transparent">
                                Select Executive Advisor
                              </h1>
                              <p className="mt-2 text-lg text-slate-600">
                                Choose your AI consultant to guide your
                                conversation
                              </p>
                            </div>
                          </div>

                          {/* Close Button */}
                          <Button
                            className="hover:-translate-y-0.5 h-12 w-12 rounded-full border border-white/60 bg-white/80 text-slate-600 shadow-lg transition-all duration-200 hover:bg-white hover:shadow-xl"
                            onClick={() => setIsOpen(false)}
                            size="icon"
                            variant="outline"
                          >
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M6 18L18 6M6 6l12 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8">
                      <div className="grid gap-8 lg:grid-cols-2">
                        {/* Current Executive Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-rose-200 to-transparent" />
                            <div className="flex items-center gap-2">
                              <Badge className="border-0 bg-emerald-100 px-4 py-2 font-semibold text-emerald-700 shadow-md">
                                Currently Active
                              </Badge>
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg"
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                              />
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-200" />
                          </div>

                          <motion.div
                            animate={{ opacity: 1, x: 0 }}
                            className="group"
                            initial={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-8 shadow-rose-100/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-200/40">
                              <div className="flex items-center gap-6">
                                <div className="relative">
                                  {getExecutiveIcon(selectedExecutive, "lg")}
                                  <div className="-bottom-2 -right-2 absolute">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                                      <svg
                                        className="h-4 w-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          d="M5 13l4 4L19 7"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-2xl text-slate-800">
                                    {selectedPersonality.name}
                                  </h3>
                                  <p className="mt-1 font-semibold text-lg text-slate-600">
                                    {selectedPersonality.role}
                                  </p>
                                  <p className="mt-3 text-slate-600 leading-relaxed">
                                    {selectedPersonality.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Other Executives Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
                            <Badge className="border-0 bg-blue-100 px-4 py-2 font-semibold text-blue-700 shadow-md">
                              Available Advisors
                            </Badge>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-200" />
                          </div>

                          <div className="space-y-4">
                            {otherExecutives.map(
                              ([key, personality], index) => (
                                <motion.button
                                  animate={{ opacity: 1, x: 0 }}
                                  className="group w-full text-left transition-all duration-300"
                                  exit={{ opacity: 0, x: -20 }}
                                  initial={{ opacity: 0, x: 20 }}
                                  key={key}
                                  onClick={() =>
                                    handleExecutiveSelect(key as BotType)
                                  }
                                  transition={{
                                    duration: 0.4,
                                    delay: 0.1 + index * 0.1,
                                  }}
                                  whileHover={{ scale: 1.02, y: -4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="rounded-2xl border border-white/40 bg-gradient-to-r from-white to-slate-50/30 p-6 shadow-lg transition-all duration-300 hover:border-indigo-200/60 hover:bg-gradient-to-br hover:from-indigo-50/30 hover:to-purple-50/30 hover:shadow-indigo-100/20 hover:shadow-xl">
                                    <div className="flex items-center gap-4">
                                      {getExecutiveIcon(key as BotType, "md")}
                                      <div className="flex-1">
                                        <h4 className="font-bold text-lg text-slate-800 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent">
                                          {personality.name}
                                        </h4>
                                        <p className="mt-1 font-medium text-slate-600">
                                          {personality.role}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-slate-500 text-sm leading-relaxed">
                                          {personality.description}
                                        </p>
                                      </div>
                                      <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                                          <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.button>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="mt-8 flex items-center justify-between border-white/20 border-t pt-6">
                        <p className="text-slate-500 text-sm">
                          Select an advisor to customize your AI conversation
                          experience
                        </p>
                        <Button
                          className="h-12 rounded-full border border-slate-200 bg-white/90 px-8 font-medium text-slate-600 shadow-lg transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 hover:shadow-xl"
                          onClick={() => setIsOpen(false)}
                          size="lg"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
