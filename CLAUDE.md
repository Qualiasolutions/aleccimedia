# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 IMPORTANT: Always Check These Files First

1. **ROADMAP.md** - Complete feature specifications and implementation priorities
2. **PROGRESS.md** - Current sprint status, what's in progress, what's next
3. **This file (CLAUDE.md)** - Coding guidelines and project structure

**Before starting ANY new work, review ROADMAP.md and update PROGRESS.md**

## Project Overview

This is an AI chatbot application called "Alecci Media" built with Next.js 15, the AI SDK v5, and modern web technologies. It's a full-featured chat application with authentication, file uploads, document management, and real-time streaming capabilities. The application features multiple AI executive personalities and uses xAI's Grok models through Vercel AI Gateway.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19 RC
- **AI**: AI SDK v5 with xAI Grok models (default)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 beta
- **Styling**: Tailwind CSS with shadcn/ui components
- **File Storage**: Vercel Blob
- **Package Manager**: pnpm
- **Code Quality**: Ultracite for linting and formatting

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Run database migrations and build for production
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run Ultracite linter to check code quality
- `pnpm format` - Auto-format and fix code with Ultracite

### Database Operations
- `pnpm db:generate` - Generate Drizzle migration files
- `pnpm db:migrate` - Run database migrations (uses tsx lib/db/migrate.ts)
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:push` - Push schema changes directly to database
- `pnpm db:pull` - Pull schema from database
- `pnpm db:check` - Check migration files
- `pnpm db:up` - Apply migrations

### Testing
- `pnpm test` - Run Playwright end-to-end tests

### Deployment
- `vercel` - Deploy to Vercel (requires Vercel CLI login)
- `vercel build` - Build locally for Vercel deployment
- `vercel env pull` - Pull environment variables from Vercel

## Architecture

### App Router Structure
```
app/
├── (auth)/           # Authentication routes (login, register)
├── (chat)/           # Main chat interface and API routes
│   ├── api/         # API endpoints (chat, documents, files)
│   └── chat/        # Individual chat pages
└── layout.tsx        # Root layout with providers
```

### Key Directories
- `components/` - React components (UI, chat, artifacts)
- `lib/` - Core utilities and configurations
  - `ai/` - AI models, prompts, tools, and executive personalities
  - `db/` - Database schema and queries
  - `editor/` - Text editor configurations
- `artifacts/` - Dynamic content generation (code, images, text, sheets)
- `hooks/` - Custom React hooks

### Database Schema
Uses Drizzle ORM with PostgreSQL. Key tables:
- `User` - User authentication data
- `Chat` - Chat sessions with visibility settings and usage tracking
- `Message_v2` - Messages with parts and attachments (current version)
- `Vote_v2` - Message voting system
- `Document` - Collaborative documents (text, code, image, sheet)
- `Suggestion` - Document editing suggestions
- `Stream` - Stream management for real-time updates

### AI Integration
- Default models: Grok Vision and Grok Reasoning via xAI
- Configured through Vercel AI Gateway
- Model definitions in `lib/ai/models.ts`
- Executive personalities in `lib/ai/executive-personalities.ts`
- Tools for weather, documents, and suggestions in `lib/ai/tools/`

### Executive Personalities
The application features multiple AI executive personalities:
- **Alexandria** - Default executive personality
- **Kim** - Alternative personality
- **Collaborative** - Team-oriented personality

Each personality has associated models, gradients, and behavior patterns defined in `lib/ai/executive-personalities.ts`.

### Authentication
NextAuth.js v5 with email/password authentication.
Configuration in `app/(auth)/auth.config.ts` and `app/(auth)/auth.ts`.

### Artifact System
Dynamic content generation supporting:
- Text documents with collaborative editing
- Code snippets with syntax highlighting
- Image generation and editing
- Spreadsheet-like data tables

Artifacts are managed through the `artifacts/` directory and support real-time collaboration.

## Code Style and Standards

This project uses Ultracite for code formatting and linting with strict rules defined in `.cursor/rules/ultracite.mdc`. Ultracite enforces:

- Zero configuration with subsecond performance
- Maximum type safety with strict TypeScript mode
- AI-friendly code generation patterns
- Comprehensive accessibility standards (a11y)


### Key Style Rules
- **TypeScript**: Strict mode enabled, no `any` types or type assertions, prefer `const` over `let`
- **Functions**: Arrow functions preferred over function expressions, comprehensive error handling with try-catch
- **Accessibility**: Strict a11y standards enforced (see ultracite.mdc for complete rules)
- **Code Quality**: No console logs, template literals over concatenation, `Array.isArray()` over `instanceof`
- **Comparisons**: Use `===` and `!==`, no `var` declarations or `with` statements
- **Formatting**: Numeric separators in large numbers, consistent accessibility modifiers

### React Best Practices
- Use `<>...</>` instead of `<Fragment>...</Fragment>`
- Don't define React components inside other components
- Make sure all dependencies are correctly specified in React hooks
- Don't forget key props in iterators (use stable identifiers, not array indices)
- Watch out for possible "wrong" semicolons inside JSX elements
- Don't pass children as props
- Use `Date.now()` instead of `new Date().getTime()`

### Accessibility Standards
- Don't use `accessKey` attribute on any HTML element
- Make sure label elements have text content and are associated with an input
- Give heading elements content that's accessible to screen readers
- Always include a `type` attribute for button elements
- Make elements with interactive roles and handlers focusable
- Accompany `onClick` with at least one of: `onKeyUp`, `onKeyDown`, or `onKeyPress`
- Always include a `title` element for SVG elements
- Use semantic elements instead of role attributes in JSX
- Make sure anchors have content that's accessible to screen readers

### Error Handling Patterns
Always wrap async operations in try-catch blocks and handle errors appropriately:

```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await fetchData();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}

// ❌ Bad: Swallowing errors or inadequate error handling
try {
  return await fetchData();
} catch (e) {
  console.log(e); // Don't use console.log for errors
}
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `AUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
- `POSTGRES_URL` - PostgreSQL database connection string
- `AI_GATEWAY_API_KEY` - AI Gateway API key (only required for non-Vercel deployments)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `REDIS_URL` - Redis URL (optional, for resumable streams)

### Vercel vs Non-Vercel Deployment
- **Vercel deployments**: OIDC authentication handled automatically via environment variables
- **Non-Vercel deployments**: Must provide `AI_GATEWAY_API_KEY` manually

## UI Components and Layout

### Sidebar System
- Desktop sidebar is always open by default (configured in layout)
- Mobile uses sheet-based navigation
- State managed through `components/mobile-sidebar-context.tsx`
- Styled with glassmorphism effects and gradients

### Model Selection
- Enhanced model selector with executive personalities
- Dropdown with increased height for better usability
- Automatic model selection based on executive choice
- Visual indicators for executive-model matches

### Chat Interface
- Real-time streaming with AI SDK v5
- Support for multimodal inputs (text, files, images)
- Artifact creation and editing capabilities
- Message voting and reasoning display

## Testing Strategy

Uses Playwright for end-to-end testing with environment variable setup.

### Running Tests
- `pnpm test` - Run all Playwright end-to-end tests (automatically sets PLAYWRIGHT=True)
- Test files located in `tests/e2e/` cover:
  - Chat functionality and streaming
  - Artifact creation and interaction
  - Authentication flows
  - Reasoning features
  - Session management

The test command automatically sets `PLAYWRIGHT=True` environment variable before running tests.

## Deployment Notes

- Optimized for Vercel deployment
- Automatic OIDC authentication for AI Gateway on Vercel
- Manual AI_GATEWAY_API_KEY required for other platforms
- Database migrations run automatically during build
- Supports both development and production environments

## Advanced Features

### Resumable Streams
- Support for interrupted chat sessions
- Requires Redis URL configuration
- Managed through `resumable-stream` package

### Usage Tracking
- Token usage tracking with TokenLens integration
- Usage data stored in chat context
- Rate limiting based on user entitlements

### File Management
- Upload support through Vercel Blob
- Multiple file types supported
- Integration with chat messages

## Common Issues and Solutions

### Sidebar Issues
- Sidebar stays open by default - changes made to layout.tsx
- White space eliminated by setting initial animation state
- Mobile uses separate sheet component for better UX

### Model Selection
- Dropdown height increased for better visibility
- Padding increased for better touch targets
- Overflow handling for long descriptions

### Performance Considerations
- Uses Next.js 15 with App Router for optimal performance
- Streaming responses for better UX
- Optimistic updates for model selection
- Efficient database queries with Drizzle ORM