# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Check Before Starting Work

1. **ROADMAP.md** - Feature specifications and priorities
2. **PROGRESS.md** - Current sprint status and next tasks

## Project Overview

AI chatbot "Alecci Media" with multiple executive personalities (Alexandria, Kim, Collaborative). Full-featured chat with authentication, file uploads, document management, streaming, and text-to-speech.

**Tech Stack:** Next.js 15 (App Router), React 19 RC, AI SDK v5 with xAI Grok via Vercel AI Gateway, PostgreSQL/Drizzle ORM, NextAuth.js v5, Tailwind/shadcn/ui, ElevenLabs TTS, pnpm

## Commands

```bash
# Development
pnpm dev                    # Start dev server (turbo)
pnpm build                  # Run migrations + build
pnpm lint                   # Ultracite linter (npx ultracite check)
pnpm format                 # Auto-fix with Ultracite (npx ultracite fix)

# Database (Drizzle)
pnpm db:migrate             # Run migrations (tsx lib/db/migrate.ts)
pnpm db:generate            # Generate migration files
pnpm db:studio              # Open Drizzle Studio
pnpm db:push                # Push schema directly

# Testing
pnpm test                   # Playwright E2E (sets PLAYWRIGHT=True)
```

## Architecture

### Request Flow
1. User sends message → `app/(chat)/api/chat/route.ts` (POST)
2. Auth check via NextAuth.js → Rate limiting check
3. Knowledge base loaded from `Knowledge Base/` directory per executive
4. System prompt built: personality + knowledge base + artifacts prompt
5. Streamed via AI SDK's `streamText()` with xAI Grok models
6. Messages saved to PostgreSQL with `botType` for attribution

### Route Groups
- `app/(auth)/` - Login, register routes
- `app/(chat)/` - Chat interface, API routes

### API Routes (`app/(chat)/api/`)
| Route | Purpose |
|-------|---------|
| `chat/route.ts` | Main chat endpoint (POST/DELETE) - 60s timeout |
| `voice/route.ts` | ElevenLabs TTS streaming - 30s timeout |
| `files/upload/route.ts` | Vercel Blob file uploads |
| `document/route.ts` | Artifact document operations |
| `suggestions/route.ts` | AI-generated suggestions |
| `history/route.ts` | Chat history retrieval |
| `vote/route.ts` | Message voting |

### Executive Personality System
Located in `lib/bot-personalities.ts`:
- **Alexandria Alecci** (CMO) - Marketing, brand strategy
- **Kim Mylls** (CSO) - Sales, pipeline optimization
- **Collaborative** - Both executives with smart context detection

Each personality has:
- Identity protection rules (never reveal AI nature)
- Formatted response guidelines (markdown tables, headers, bullets)
- Knowledge base ownership framing ("my article", "as I wrote")

### Knowledge Base System
Located in `lib/ai/knowledge-base.ts`:
- Reads from `Knowledge Base/` directory at project root
- Per-executive folders: `Alexandria/`, `Kim/`, `Kim and Alex shared/`
- Supports: PDF, DOCX, XLSX, MD, TXT files
- 5-minute memory cache per bot type
- Content injected into system prompt as "authored work"

### AI Model Configuration
Located in `lib/ai/providers.ts`:
```typescript
// Production models via Vercel AI Gateway
"chat-model": gateway("xai/grok-3-fast")
"chat-model-reasoning": gateway("xai/grok-3")
"title-model": gateway("xai/grok-3-fast")
"artifact-model": gateway("xai/grok-3-fast")
```
Test environment uses mocks from `lib/ai/models.mock.ts`.

### Database Schema
Located in `lib/db/schema.ts`:
- `User` - User accounts
- `Chat` - Chat sessions with `lastContext` (usage tracking)
- `Message_v2` - Messages with `parts`, `attachments`, `botType`
- `Vote_v2` - Message voting
- `Document` - Artifacts (text, code, image, sheet)
- `Suggestion` - Document suggestions
- `Stream` - Resumable stream tracking

### Artifact System
Tools defined in `lib/ai/tools/`:
- `createDocument` - Creates artifacts (code, text, sheets)
- `updateDocument` - Modifies existing artifacts
- `requestSuggestions` - AI suggestions for documents
- `getWeather` - Weather tool

Document kinds: `text`, `code`, `image`, `sheet`

### Voice/TTS System
Located in `lib/ai/voice-config.ts` and `app/(chat)/api/voice/route.ts`:
- ElevenLabs API integration with `eleven_flash_v2_5` model
- Per-executive voice IDs (configurable via env vars)
- Markdown stripping for cleaner speech
- Max 5000 characters per request

## Code Standards (Ultracite)

**Critical Rules:**
- No `console.log` - use `console.error` for errors only
- No `any` types - strict TypeScript
- Use `===` and `!==` only
- Arrow functions over function expressions
- No `var` - use `const`, then `let` if needed
- No TypeScript enums - use objects with `as const`

**React:**
- Use `<>` not `<Fragment>`
- No components inside components
- Keys must be stable IDs (not array indices)
- Hook dependencies must be complete
- No array index keys

**Accessibility:**
- `type` attribute required on `<button>`
- `onClick` needs keyboard handler (`onKeyDown`/`onKeyUp`/`onKeyPress`)
- `<img>` needs meaningful `alt`
- SVGs need `<title>`
- Don't use `accessKey` attribute

**Next.js:**
- Don't use `<img>` - use Next.js `Image` component
- Don't use `<head>` - use `next/head` or metadata API

## Environment Variables

Required in `.env.local`:
```
AUTH_SECRET=                # openssl rand -base64 32
POSTGRES_URL=               # PostgreSQL connection string
BLOB_READ_WRITE_TOKEN=      # Vercel Blob storage token
NEXT_PUBLIC_APP_URL=        # App URL (e.g., http://localhost:3000)
```

Optional:
```
REDIS_URL=                  # For resumable streams
ELEVENLABS_API_KEY=         # ElevenLabs TTS API key
ELEVENLABS_VOICE_ID_ALEXANDRIA=  # Alexandria's voice ID (default: kfxR5DufiGBogKn26hyv)
ELEVENLABS_VOICE_ID_KIM=    # Kim's voice ID (default: wMmwtV1VyRNXQx00eD6W)
AI_GATEWAY_API_KEY=         # Only for non-Vercel deployments
```

Note: On Vercel, xAI Grok is accessed via Vercel AI Gateway with automatic OIDC authentication.

## Deployment

Optimized for Vercel. Database migrations run during `pnpm build`.
Production URL: https://aleccimedia.vercel.app