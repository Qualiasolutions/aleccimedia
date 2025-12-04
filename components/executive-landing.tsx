import { motion } from "framer-motion";
import { Brain, Crown, Sparkles, UserRound, Users, Zap } from "lucide-react";
import Image from "next/image";
import { BOT_PERSONALITIES, type BotType } from "@/lib/bot-personalities";
import { cn } from "@/lib/utils";

type ExecutiveLandingProps = {
  selectedBot: BotType;
  onSelect: (bot: BotType) => void;
  className?: string;
};

const executives: { key: BotType; icon: typeof Crown }[] = [
  { key: "alexandria", icon: Crown },
  { key: "kim", icon: UserRound },
  { key: "collaborative", icon: Users },
];

export function ExecutiveLanding({
  selectedBot,
  onSelect,
  className,
}: ExecutiveLandingProps) {
  return (
    <section
      className={cn(
        "relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-rose-50/30 px-4 py-6 sm:px-6 sm:py-8",
        className
      )}
    >
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-200/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-3xl space-y-6 text-center sm:space-y-8">
        {/* Logo/Brand Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
          initial={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25 sm:size-12">
              <Brain className="size-5 text-white sm:size-6" />
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 bg-clip-text font-bold text-2xl text-transparent tracking-tight sm:text-3xl lg:text-4xl">
            Your AI Boss Brainz
          </h1>
          <p className="mx-auto max-w-md text-sm text-stone-500 sm:text-base">
            Strategic intelligence powered by Alexandria & Kim
          </p>
        </motion.div>

        {/* Executive Selection Cards */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {executives.map(({ key, icon: Icon }) => {
            const personality = BOT_PERSONALITIES[key];
            const isSelected = selectedBot === key;
            return (
              <motion.button
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all duration-300 sm:p-5",
                  isSelected
                    ? "border-rose-400 bg-gradient-to-b from-rose-50 to-red-50 shadow-xl shadow-rose-300/40"
                    : "border-stone-200 bg-white hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50"
                )}
                key={key}
                onClick={() => onSelect(key)}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileHover={{ scale: 1.015, y: -3 }}
                whileTap={{ scale: 0.985 }}
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  {personality.avatar ? (
                    <Image
                      alt={personality.name}
                      className={cn(
                        "size-14 rounded-full border-2 object-cover transition-all sm:size-16 lg:size-18",
                        isSelected ? "border-rose-400 shadow-md" : "border-stone-200"
                      )}
                      height={72}
                      src={personality.avatar}
                      width={72}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full transition-all sm:size-16 lg:size-18",
                        isSelected
                          ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md"
                          : "bg-stone-100 text-stone-500"
                      )}
                    >
                      <Icon className="size-6 sm:size-7" />
                    </div>
                  )}
                  {isSelected && (
                    <motion.div
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-rose-500 shadow-sm"
                      initial={{ scale: 0 }}
                    >
                      <svg className="size-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                      </svg>
                    </motion.div>
                  )}
                </div>

                {/* Name */}
                <h3 className={cn(
                  "font-semibold text-sm transition-colors sm:text-base",
                  isSelected ? "text-rose-700" : "text-stone-700"
                )}>
                  {key === "collaborative" ? "Both" : personality.name.split(" ")[0]}
                </h3>

                {/* Role */}
                <p className={cn(
                  "mt-1 text-xs transition-colors sm:text-sm",
                  isSelected ? "text-rose-600/70" : "text-stone-400"
                )}>
                  {key === "collaborative" ? "Team Mode" : personality.role.split("(")[0].trim()}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Capabilities */}
        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { icon: Zap, label: "GTM Strategy" },
            { icon: Sparkles, label: "Revenue Growth" },
            { icon: Brain, label: "Smart Insights" },
          ].map(({ icon: ItemIcon, label }) => (
            <span className="flex items-center gap-2 text-xs text-stone-500 sm:text-sm" key={label}>
              <ItemIcon className="size-3.5 text-rose-500 sm:size-4" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
