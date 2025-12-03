# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before Starting Work

**Always check these files first:**
1. **ROADMAP.md** - Feature specifications and priorities
2. **PROGRESS.md** - Current sprint status and what's next

## Commands

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Migrate DB + build for production
pnpm lint             # Ultracite linter check
pnpm format           # Auto-format with Ultracite

# Database (Drizzle ORM)
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate migration files
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Playwright E2E tests (sets PLAYWRIGHT=True)
```

## Architecture

### Route Groups
```
app/
├── (auth)/           # Login, register, NextAuth API
├── (chat)/           # Main chat UI and API routes
│   └── api/          # chat, document, files, vote, suggestions, history
```

### Core AI System (`lib/ai/`)
- **`executive-personalities.ts`** - Defines 3 executives with model mappings:
  - Alexandria (CMO) → `chat-model` (Grok Vision)
  - Kim (CSO) → `chat-model-reasoning` (Grok Reasoning)
  - Collaborative → `chat-model`
- **`models.ts`** - Model definitions (Grok Vision, Grok Reasoning, Gemini Pro)
- **`providers.ts`** - Vercel AI Gateway configuration
- **`prompts.ts`** - System prompts per executive
- **`tools/`** - AI tools: create-document, update-document, get-weather, request-suggestions

### Database Schema (`lib/db/schema.ts`)
- `User` - Authentication
- `Chat` - Sessions with `lastContext` (usage tracking)
- `Message_v2` - Messages with `parts`, `attachments`, `botType` (executive who responded)
- `Vote_v2` - Message voting
- `Document` - Artifacts (text, code, image, sheet)
- `Suggestion` - Document edit suggestions
- `Stream` - Resumable stream management

### Key Components
- `components/message.tsx` - Executive-specific styling (gradients per bot type)
- `components/executive-landing.tsx` - Conversation starters per executive
- `components/mobile-sidebar-context.tsx` - Sidebar state management
- `artifacts/` - Dynamic content generation (code, image, text, sheet)

## Code Standards

**Enforced by Ultracite** (see `.cursor/rules/ultracite.mdc`):

- **No `console.log`** - Use `console.error` for errors only
- **No `any` types** - Strict TypeScript mode
- **Arrow functions** over function expressions
- **`===` and `!==`** only
- **No `var`** - Use `const`, prefer over `let`
- **Array keys** - Use stable IDs, not array indices
- **A11y required**: `type` on buttons, `title` on SVGs, keyboard handlers with `onClick`

### React Patterns
```tsx
// ✅ Fragments
<>...</>  // not <Fragment>...</Fragment>

// ✅ Error handling
try {
  const result = await fetchData();
  return { success: true, data: result };
} catch (error) {
  console.error('Failed:', error);
  return { success: false, error: error.message };
}
```

## Environment Variables

Required in `.env.local`:
- `AUTH_SECRET` - `openssl rand -base64 32`
- `POSTGRES_URL` - PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage

Optional:
- `AI_GATEWAY_API_KEY` - Only for non-Vercel deployments (Vercel uses OIDC)
- `REDIS_URL` - For resumable streams

## Testing

E2E tests in `tests/e2e/` cover:
- Chat streaming and functionality
- Artifact creation/interaction
- Authentication flows
- Reasoning features

## Key Files for Common Tasks

| Task | Files |
|------|-------|
| Add AI tool | `lib/ai/tools/`, register in `app/(chat)/api/chat/route.ts` |
| Modify executive behavior | `lib/ai/prompts.ts`, `lib/ai/executive-personalities.ts` |
| Add DB table | `lib/db/schema.ts`, then `pnpm db:generate && pnpm db:migrate` |
| Style messages by executive | `components/message.tsx` (getExecutiveStyling) |
| Add conversation starters | `components/executive-landing.tsx` (conversationStarters) |