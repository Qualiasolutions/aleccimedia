# Alecci Media AI - Product Roadmap & Improvement Plan

**Last Updated:** 2025-10-24  
**Status:** Active Development

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Implementation Priority Matrix](#implementation-priority-matrix)
3. [Progress Tracking](#progress-tracking)
4. [Detailed Feature Specifications](#detailed-feature-specifications)
5. [Technical Requirements](#technical-requirements)

---

## Overview

This roadmap outlines strategic improvements for the Alecci Media AI chatbot application. Features are prioritized by impact and effort, with clear ownership and implementation guidelines.

**Core Differentiator:** Executive personality-driven AI consultancy experience

---

## Implementation Priority Matrix

### 🔥 HIGH IMPACT, LOW EFFORT (Sprint 1-2)

- [x] **Bot Type Badge on Messages** `#ui` `#quick-win` ✅ 2025-10-24
  - Show which executive responded with colored badge
  - Match executive gradient colors
  - **Files:** `components/enhanced-chat-message.tsx`
  - **Completed:** Badge already existed, verified styling

- [x] **Conversation Stats in History** `#feature` `#quick-win` ✅ 2025-10-24
  - Show executive distribution per chat
  - Message count, date range
  - **Files:** `app/(chat)/history/page.tsx`
  - **Completed:** Added chatStats with primaryBot detection and message counts

- [x] **Executive-Specific Message Styling** `#ui` `#quick-win` ✅ 2025-10-24
  - Alexandria: Rose gradient border
  - Kim: Blue gradient border
  - Collaborative: Mixed gradient
  - **Files:** `components/message.tsx`
  - **Completed:** Executive-specific gradients, borders, and shadows implemented

- [x] **Better Empty States** `#ux` `#quick-win` ✅ 2025-10-24
  - Suggest conversation starters per executive
  - Show example queries
  - **Files:** `components/executive-landing.tsx`, `components/chat.tsx`
  - **Completed:** 4 clickable suggestions per executive that prefill input

- [ ] **Executive Memory System** `#enhancement` `#ai`
  - Track which executive handles which topics per user
  - Store user preferences (tends to prefer Alexandria for branding)
  - Show statistics in chat history (45% Alexandria, 35% Kim, 20% Collaborative)
  - **Files:** `lib/db/schema.ts`, `lib/db/queries.ts`, new `lib/ai/executive-memory.ts`
  - **Estimate:** 3-5 days

- [ ] **Message Reactions Beyond Voting** `#ux` `#feature`
  - Add reaction types: "Actionable", "Needs Clarification", "Ready to Implement", "Save for Later"
  - Store reactions in database with message metadata
  - Show reaction counts and allow filtering
  - **Files:** `lib/db/schema.ts`, `components/message-actions.tsx`, new `components/message-reactions.tsx`
  - **Estimate:** 2-3 days

- [ ] **Conversation Analytics Panel** `#analytics` `#ux`
  - Real-time topic drift detector
  - Missing context alerts ("Would benefit from Alexandria's perspective")
  - Conversation depth metrics
  - **Files:** new `components/conversation-analytics.tsx`, `components/chat.tsx`
  - **Estimate:** 3-4 days

- [ ] **Reports Library Page** `#feature` `#page`
  - New route: `/app/(chat)/reports/page.tsx`
  - List all AI-generated artifacts with metadata
  - Filter by executive, date, topic
  - Export to PDF with executive branding
  - **Files:** new `app/(chat)/reports/*`, `lib/db/queries.ts` (report queries)
  - **Estimate:** 4-5 days

- [ ] **Executive Focus Modes** `#ai` `#enhancement`
  - Sub-modes: "Brand Crisis", "Launch Campaign", "Pipeline Audit", "Deal Closing"
  - Visual indicators (small badge on avatar)
  - Context-aware mode suggestions
  - **Files:** `lib/bot-personalities.ts`, `components/executive-switch.tsx`, `lib/ai/prompts.ts`
  - **Estimate:** 2-3 days

### 🎯 HIGH IMPACT, MEDIUM EFFORT (Sprint 3-5)

- [ ] **Dynamic Executive Handoffs** `#ai` `#feature`
  - Detect "@kim take over" or "bring Alexandria in"
  - Visual handoff notes summarizing previous context
  - Smooth executive transitions mid-conversation
  - **Files:** `lib/ai/prompts.ts`, `app/(chat)/api/chat/route.ts`, `components/executive-handoff.tsx`
  - **Estimate:** 5-7 days

- [ ] **Strategy Templates Hub** `#feature` `#page`
  - New route: `/app/(chat)/templates/page.tsx`
  - Pre-built conversation starters
  - **Estimate:** 5-6 days

- [ ] **Personal Strategy Dashboard** `#feature` `#page`
  - Analytics and insights visualization
  - **Estimate:** 7-10 days

- [ ] **Advanced Artifact Versioning UI** `#feature` `#ux`
  - Visual timeline and diff view
  - **Estimate:** 5-7 days

- [ ] **Proactive Executive Suggestions** `#ai` `#feature`
  - Daily strategy nuggets
  - **Estimate:** 7-10 days

### 🚀 HIGH IMPACT, HIGH EFFORT (Sprint 6-12)

- [ ] **Conversation Branching & Threading**
- [ ] **Real-Time Collaboration (WebSockets)**
- [ ] **Multi-Modal Strategy Builder**
- [ ] **Team Collaboration Hub**
- [ ] **Semantic Search & Vector Memory**

### 💎 UNIQUE DIFFERENTIATORS (Sprint 13+)

- [ ] **Executive Role-Playing Exercises**
- [ ] **Strategy Battle Royale**
- [ ] **Conversation Time Manipulation**
- [ ] **Executive Marketplace**

---

## Progress Tracking

### Completed Features ✅

- [x] Basic executive personality system (Alexandria, Kim, Collaborative)
- [x] Executive switch UI with modal selector
- [x] Message voting system
- [x] Artifact creation (text, code, image, sheet)
- [x] Chat history with basic analytics
- [x] File uploads via Vercel Blob
- [x] Voice input button
- [x] Responsive design with sidebar
- [x] Authentication (NextAuth v5)
- [x] Database with Drizzle ORM
- [x] AI streaming with SDK v5
- [x] **Bot type badge on messages** (2025-10-24)
- [x] **Executive-specific message styling** (2025-10-24)
- [x] **Conversation starters on empty state** (2025-10-24)
- [x] **Conversation stats in history page** (2025-10-24)

### In Progress 🚧

- [ ] (None - check PROGRESS.md for next sprint plans)

---

## Development Guidelines

### Before Starting Any Feature:

1. **Check this roadmap** for specifications
2. **Review related files** listed in feature description
3. **Check dependencies** - does it require other features first?
4. **Update progress** - move to "In Progress" when starting

### When Completing a Feature:

1. **Update PROGRESS.md** with completion date
2. **Mark as complete** in this file with ✅
3. **Document** any deviations from spec
4. **Add tests** if applicable
5. **Update CLAUDE.md** if it affects coding patterns

### Code Quality Standards:

- Follow Ultracite linting rules
- Maintain strict TypeScript mode
- Add comprehensive error handling
- Write accessibility-compliant UI

---

**Remember:** The core differentiator is making executives feel like real consultants, not just chatbots.
