import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
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

const conversationStarters: Record<BotType, string[]> = {
  alexandria: [
    "Help me develop a brand positioning strategy for our Q1 launch",
    "Review our current social media campaigns and suggest improvements",
    "Create a content calendar for the next month focused on thought leadership",
    "What are the latest marketing trends I should be aware of?",
    "Help me craft a compelling brand story for our target audience",
  ],
  kim: [
    "Analyze my sales pipeline and identify bottlenecks",
    "Help me prepare a pitch for an enterprise client meeting tomorrow",
    "What strategies can improve our close rate this quarter?",
    "Review our pricing strategy for competitive positioning",
    "How can I motivate my sales team to hit quarterly targets?",
  ],
  collaborative: [
    "Design a comprehensive go-to-market strategy for our new product",
    "Align our marketing and sales efforts for maximum impact",
    "Create a revenue optimization plan combining brand and pipeline strategies",
    "Help us prepare for a major product launch with both CMO and CSO insights",
    "Review our entire customer acquisition funnel from awareness to close",
  ],
};

type ExecutiveLandingProps = {
  selectedBot: BotType;
  onSelect: (bot: BotType) => void;
  onStarterClick?: (starter: string) => void;
  className?: string;
};

export function ExecutiveLanding({
  selectedBot,
  onSelect,
  onStarterClick,
  className,
}: ExecutiveLandingProps) {
  const starters = conversationStarters[selectedBot];
  return (
    <section
      className={cn(
        "relative mx-auto w-full max-w-6xl px-3 pt-6 pb-12 sm:px-6 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24",
        className
      )}
    >
      <div className="grid gap-6 sm:gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,1fr)] lg:items-start">
        <div className="space-y-4 sm:space-y-8 text-slate-900">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/80 px-3 sm:px-4 py-0.5 sm:py-1 font-semibold text-rose-600 text-xs sm:text-sm shadow-sm ring-1 ring-rose-100 backdrop-blur"
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center text-rose-500">
              <CheckCircleFillIcon size={10} />
            </div>
            Alecci Media AI Council
          </motion.span>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-2xl sm:text-4xl tracking-tight lg:text-5xl"
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            Strategy sessions with your AI executive team
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl text-sm sm:text-lg text-slate-600 leading-relaxed"
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
            className="grid gap-3 sm:gap-4 sm:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            {highlights.map(({ title, description }, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl sm:rounded-3xl border border-white/70 bg-white/90 p-3 sm:p-5 shadow-lg shadow-rose-100/40 backdrop-blur"
                initial={{ opacity: 0, y: 14 }}
                key={title}
                transition={{ duration: 0.35, delay: 0.16 + index * 0.06 }}
              >
                <dt className="font-semibold text-rose-500 text-xs sm:text-sm uppercase tracking-wide">
                  {title}
                </dt>
                <dd className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600">{description}</dd>
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl sm:rounded-3xl border border-white/70 bg-white/90 p-3 sm:p-5 shadow-lg shadow-rose-100/40 backdrop-blur sm:col-span-2"
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.35, delay: 0.26 }}
            >
              <dt className="font-semibold text-rose-500 text-xs sm:text-sm uppercase tracking-wide">
                Trusted Delivery
              </dt>
              <dd className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600">
                Built on Alecci Media&apos;s playbooks with enterprise-ready
                guardrails, tone control, and instant exports for your team.
              </dd>
            </motion.div>
          </motion.dl>
        </div>

        <div className="relative space-y-6">
          <div
            aria-hidden="true"
            className="-translate-y-8 pointer-events-none absolute inset-0 translate-x-8 rounded-[36px] bg-gradient-to-br from-rose-200/60 via-white/40 to-amber-100/50 blur-3xl"
          />

          <div className="relative rounded-[36px] border border-white/70 bg-white/95 p-6 shadow-2xl shadow-rose-200/30 backdrop-blur-xl">
            <BotSelector
              className="mx-auto w-full p-0"
              onBotSelect={onSelect}
              selectedBot={selectedBot}
              showIntro={false}
            />
          </div>

          {/* Conversation Starters */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl sm:rounded-[36px] border border-white/70 bg-white/95 p-3 sm:p-6 shadow-xl shadow-rose-200/20 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                Conversation Starters
              </h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {starters.slice(0, 4).map((starter, index) => (
                <motion.button
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full rounded-lg sm:rounded-xl border border-rose-100 bg-gradient-to-r from-white to-rose-50/30 p-2 sm:p-3 text-left text-xs sm:text-sm text-slate-700 transition-all duration-200 hover:border-rose-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100/50 hover:shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  key={starter}
                  onClick={() => onStarterClick?.(starter)}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  type="button"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {starter}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
