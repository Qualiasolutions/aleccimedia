import { motion } from "framer-motion";
import type { BotType } from "@/lib/bot-personalities";
import { cn } from "@/lib/utils";
import { BotSelector } from "./bot-selector";
import { CheckCircleFillIcon } from "./icons";

const highlights = [
  {
    title: "CMO + CSO Synergy",
    description:
      "Blend brand strategy with revenue architecture in a single conversation.",
  },
  {
    title: "Executive Tone Guaranteed",
    description:
      "Every response sounds like seasoned leadership—polished, confident, actionable.",
  },
];

type ExecutiveLandingProps = {
  selectedBot: BotType;
  onSelect: (bot: BotType) => void;
  className?: string;
};

export function ExecutiveLanding({
  selectedBot,
  onSelect,
  className,
}: ExecutiveLandingProps) {
  return (
    <section
      className={cn(
        "relative mx-auto w-full max-w-6xl px-3 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 lg:pt-6 lg:pb-8",
        className
      )}
    >
      <div className="grid gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,1fr)] lg:items-start">
        <div className="space-y-3 text-slate-900 sm:space-y-5">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-0.5 font-semibold text-rose-600 text-xs shadow-sm ring-1 ring-rose-100 backdrop-blur sm:gap-2 sm:px-4 sm:py-1 sm:text-sm"
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex h-2.5 w-2.5 items-center justify-center text-rose-500 sm:h-3 sm:w-3">
              <CheckCircleFillIcon size={10} />
            </div>
            Alecci Media AI Council
          </motion.span>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-xl tracking-tight sm:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            Strategy sessions with your AI executive team
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl text-slate-600 text-xs leading-relaxed sm:text-base lg:text-lg"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            Alexandria Alecci (CMO) and Kim Mylls (CSO) collaborate in real-time
            to ship GTM plans, revenue playbooks, and polished executive
            communications. Choose a leader—or bring the full council into your
            next meeting.
          </motion.p>

          <motion.dl
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2 sm:grid-cols-2 sm:gap-3"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            {highlights.map(({ title, description }, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/70 bg-white/90 p-2.5 shadow-lg shadow-rose-100/40 backdrop-blur sm:rounded-2xl sm:p-4"
                initial={{ opacity: 0, y: 14 }}
                key={title}
                transition={{ duration: 0.35, delay: 0.16 + index * 0.06 }}
              >
                <dt className="font-semibold text-[10px] text-rose-500 uppercase tracking-wide sm:text-xs">
                  {title}
                </dt>
                <dd className="mt-1 text-[11px] text-slate-600 sm:mt-1.5 sm:text-sm">
                  {description}
                </dd>
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/70 bg-white/90 p-2.5 shadow-lg shadow-rose-100/40 backdrop-blur sm:col-span-2 sm:rounded-2xl sm:p-4"
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.35, delay: 0.26 }}
            >
              <dt className="font-semibold text-[10px] text-rose-500 uppercase tracking-wide sm:text-xs">
                Trusted Delivery
              </dt>
              <dd className="mt-1 text-[11px] text-slate-600 sm:mt-1.5 sm:text-sm">
                Built on Alecci Media&apos;s playbooks with enterprise-ready
                guardrails, tone control, and instant exports for your team.
              </dd>
            </motion.div>
          </motion.dl>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="-translate-y-4 pointer-events-none absolute inset-0 translate-x-4 rounded-[24px] bg-gradient-to-br from-rose-200/60 via-white/40 to-amber-100/50 blur-3xl"
          />

          <div className="relative rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-2xl shadow-rose-200/30 backdrop-blur-xl sm:rounded-[32px] sm:p-5">
            <BotSelector
              className="mx-auto w-full p-0"
              onBotSelect={onSelect}
              selectedBot={selectedBot}
              showIntro={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
