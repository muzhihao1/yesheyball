# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start Express API with Vite dev server on http://localhost:5000
npm run build        # Bundle client + server into dist/
npm run start        # Serve production build from dist/
npm run check        # Run TypeScript strict compiler
npm run db:push      # Push Drizzle schema changes to database
```

### Build Details
- `build:client` — Vite builds React SPA to `dist/public`
- `build:server` — TypeScript compiles server to `dist/server` with ESM `.js` extensions
- `build:copy-shared` — Copies shared types to dist for runtime

## Architecture Overview

### Deployment Model: Vercel Serverless
This application uses a **dual-mode architecture** designed for Vercel's serverless runtime:

**Development Mode**: Traditional Express server with Vite dev middleware
- Entry: `server/devServer.ts` → `server/index.ts` (createApp)
- Hot reload for both client and server code
- Local uploads served from `uploads/` directory

**Production Mode**: Serverless Express via Vercel Functions
- Entry: `api/index.ts` imports compiled `dist/server/server/index.js`
- Each request spawns serverless function (with app caching)
- Static assets served from `dist/public`
- `vercel.json` routes `/api/*` to serverless function, fallback to SPA

### Critical: ESM Compilation
The server **must** compile to ESM (`.js` extensions) because:
- Vercel's Node.js 20 runtime requires ESM for serverless functions
- `package.json` declares `"type": "module"`
- All server imports must include `.js` extensions: `import { foo } from "./bar.js"`
- TypeScript config uses `"module": "ESNext"` and outputs `.js` files

### Client Architecture (React SPA)
```
client/src/
├── pages/           # Route components (Landing, Levels, Tasks, Profile, etc.)
├── components/      # Reusable UI (header, navigation, modals)
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom React hooks (useAuth, useUser, etc.)
├── lib/             # Client utilities (queryClient, API helpers)
└── data/            # Static training course definitions
```

**Key Patterns**:
- **Routing**: Wouter (`Switch`, `Route`, `useLocation`)
- **Data Fetching**: TanStack Query with custom hooks
- **State**: React Query cache + component state (no Redux/Zustand)
- **Styling**: Tailwind CSS with `@/` path alias
- **Auth**: Session-based via `useAuth()` hook checking `/api/auth/session`

### Server Architecture (Express + Serverless)
```
server/
├── index.ts              # createApp() — Express setup, middleware, error handler
├── devServer.ts          # Development entry point
├── routes.ts             # API route definitions (registerRoutes)
├── auth.ts               # Session auth, Replit OAuth, demo mode
├── storage.ts            # Database operation interface (Drizzle)
├── db.ts                 # Database connection (Neon/Vercel Postgres)
├── experienceSystem.ts   # EXP calculation, level-up logic
├── adaptiveLearning.ts   # Exercise progression engine
├── openai.ts             # AI feedback generation (GPT-4o)
├── imageAnalyzer.ts      # Exercise validation via AI vision
└── dailyCourses.ts       # 30-day structured curriculum data
```

**Key Patterns**:
- **API Design**: RESTful with Zod validation, JSON responses
- **Auth Flow**:
  - Replit OAuth via `setupAuth()` in routes.ts
  - Session stored in database (`sessions` table)
  - `isAuthenticated` middleware protects routes
  - Demo mode when `AUTH_DISABLED=true` (no database)
- **Database**: Drizzle ORM with PostgreSQL (Neon/Vercel/Supabase)
- **AI Integration**: OpenAI API for coaching feedback and image analysis
- **Error Handling**: Central error middleware in `index.ts`

### Shared Code
```
shared/schema.ts         # Drizzle tables, Zod schemas, TypeScript types
```
- Imported as `@shared/schema.js` in server (ESM)
- Imported as `@shared/schema` in client (via Vite alias)
- Defines: users, trainingSessions, diaryEntries, tasks, feedbacks, etc.
- Includes insertSchemas for request validation

## Critical Path Aliases

```typescript
// Configured in tsconfig.json + vite.config.ts
"@/*"        → client/src/*      // Client-side only
"@shared/*"  → shared/*          // Both client and server
"@assets/*"  → attached_assets/* // Client-side static assets
```

**Server imports**: Must use relative paths with `.js` extensions
```typescript
// Correct in server code:
import { storage } from "./storage.js";
import { users } from "../shared/schema.js";

// Incorrect (will break in production):
import { storage } from "./storage";
import { users } from "@shared/schema";
```

## Database Schema (Key Tables)

### users
- Primary key: `id` (varchar, Replit user ID)
- Tracks: level, exp, streak, totalDays, completedTasks, totalTime
- Sequential progression: `currentLevel`, `currentExercise`, `completedExercises` (JSONB)
- Auth fields: email, firstName, lastName, profileImageUrl

### trainingSessions
- Records completed exercises with duration, rating, feedback
- Links to user and training program
- Drives experience calculation and streak logic

### trainingPrograms
- 30-day structured curriculum (Ye's Billiards Academy system)
- 8 skill levels from beginner to master
- Contains: title, description, videoUrl, requirements, ballPatterns

### diaryEntries
- User training reflections with optional images
- AI-generated insights via OpenAI

## Experience System Logic

**EXP Calculation** (server/experienceSystem.ts):
- Guided training: base + duration bonus + rating bonus
- Custom training: duration × 2 + rating bonus
- Special training: duration × 1.5 + rating bonus
- Completion bonus: +20 EXP
- Level thresholds increase exponentially

**Training Streak** (server/routes.ts):
- Calculated from actual completed sessions (not calendar days)
- Current streak: consecutive days from today/yesterday
- Tracks 7-day activity pattern for UI visualization
- Encouragement messages based on streak milestones

## Key API Endpoints

### Auth
- `POST /api/auth/session` — Current user session
- `GET /api/auth/replit` — Initiate OAuth flow
- `GET /api/auth/replit/callback` — OAuth callback
- `POST /api/auth/logout` — End session

### Training
- `GET /api/training-sessions` — User's training history
- `POST /api/training-sessions` — Record completed session (+ triggers EXP calculation)
- `GET /api/training-programs/:level` — Get exercises for level
- `POST /api/analyze-exercise` — AI vision validation of exercise setup

### Progress
- `GET /api/user/:id` — User profile with computed stats (streak, level, EXP)
- `GET /api/users/me/experience` — Detailed EXP breakdown
- `POST /api/recalculate-experience` — Recompute user EXP from scratch

### AI Features
- `POST /api/coaching-feedback` — Generate personalized coaching advice
- `POST /api/diary-insights` — Analyze diary entry with AI

## Environment Variables (Required)

```bash
DATABASE_URL=postgres://...        # Neon/Vercel Postgres connection
SESSION_SECRET=random-string       # Session encryption key
OPENAI_API_KEY=sk-...             # GPT-4o access

# Replit Auth (optional, for OAuth)
REPLIT_DOMAINS=replit.com,repl.co
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com

# Development toggles
AUTH_DISABLED=true                 # Enable demo mode (no login required)
AUTH_DISABLED_EMAIL=demo@local.test
AUTH_DISABLED_USER_ID=demo-user
NODE_ENV=development|production
```

## Development Patterns

### Adding New API Endpoints
1. Define route in `server/routes.ts` using `registerRoutes()`
2. Add Zod schema validation in `shared/schema.ts` if needed
3. Implement database operations in `server/storage.ts` or direct Drizzle queries
4. Use `isAuthenticated` middleware for protected routes
5. Return consistent JSON: `{ data: ... }` or `{ message: ... }`

### Adding Database Tables
1. Define schema in `shared/schema.ts` with Drizzle ORM
2. Export insert/select types and Zod schemas
3. Run `npm run db:push` to sync database
4. Update `server/storage.ts` interface if needed

### Client Data Fetching Pattern
```typescript
// Custom hook in client/src/hooks/
export function useTrainingSessions() {
  return useQuery({
    queryKey: ['/api/training-sessions'],
    queryFn: () => fetch('/api/training-sessions').then(r => r.json()),
  });
}

// Usage in component
const { data: sessions, isLoading } = useTrainingSessions();
```

### Image Upload Flow
1. Client uploads to `/api/upload` (multer middleware)
2. Development: Saved to `uploads/` directory
3. Production: Should use Vercel Blob (requires `BLOB_READ_WRITE_TOKEN`)
4. Returns `{ url: "/uploads/filename.jpg" }` or Blob URL

## Testing Checklist

Since automated tests are minimal, manually verify:
- [ ] `npm run check` passes (TypeScript)
- [ ] `npm run build` succeeds
- [ ] Core flows work after changes:
  - Login via Replit OAuth or demo mode
  - Complete training session
  - View AI feedback
  - Check experience/level update
  - View streak calculation
- [ ] Server logs show no errors on key operations
- [ ] Database schema pushes without conflicts

## Common Gotchas

1. **ESM Import Extensions**: Server code must use `.js` in imports
   - Wrong: `import { foo } from "./bar"`
   - Right: `import { foo } from "./bar.js"`

2. **Path Aliases**: Don't use `@/` or `@shared/` in server code
   - Client can use aliases (Vite resolves them)
   - Server must use relative paths (Node ESM requires it)

3. **Vercel Serverless Limitations**:
   - No persistent filesystem (uploads disappear)
   - Each request is a cold start (minimize initialization)
   - Use Vercel Blob for file storage in production

4. **Auth Demo Mode**: When `AUTH_DISABLED=true`, app bypasses login
   - Uses hardcoded `demoUserProfile` from `server/auth.ts`
   - Database operations still work if `DATABASE_URL` provided
   - Useful for local testing without Replit OAuth setup

5. **Experience Calculation**: Triggered automatically on session POST
   - Don't manually update `exp`/`level` fields
   - Use `recalculateUserExperience()` to rebuild from sessions

6. **Training Progression**: Sequential unlock system
   - Users must complete exercises in order within each level
   - `currentExercise` tracks next unlocked exercise
   - `completedExercises` JSONB tracks per-level completion counts

## Production Deployment (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables (DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY)
4. Build command: `npm run build` (default)
5. Output directory: `dist/public` (configured in vercel.json)
6. API routes: Automatically handled by `api/index.ts`

**First Deploy Checklist**:
- [ ] Database schema pushed (`npm run db:push` locally first)
- [ ] Environment variables set in Vercel dashboard
- [ ] Test login flow (Replit OAuth or demo mode)
- [ ] Verify API routes work (`/api/auth/session`)
- [ ] Check serverless function logs for errors

## AI Integration Details

**OpenAI Models Used**:
- GPT-4o: Coaching feedback, diary insights
- GPT-4o-vision: Exercise image analysis (ball positioning validation)

**Feedback Generation Flow**:
1. User completes training session with rating
2. Client calls `/api/coaching-feedback` with session data
3. Server constructs prompt with training context
4. OpenAI returns personalized advice in Chinese
5. Feedback saved to `feedbacks` table

**Image Analysis Flow**:
1. User uploads exercise setup photo
2. Client calls `/api/analyze-exercise` with image + requirements
3. Server sends to GPT-4o-vision with structured prompt
4. Returns validation result: pass/fail + specific feedback
5. Used for skill assessment gates

## Code Quality Expectations

- **TypeScript**: Strict mode, explicit types for function parameters/returns
- **Error Handling**: Try-catch in async routes, central error middleware
- **Logging**: Console logs for key operations (session create, EXP calc, AI calls)
- **Validation**: Zod schemas for all API inputs
- **Naming**: Descriptive names, camelCase for functions/variables, PascalCase for components
- **Comments**: Explain complex logic (especially EXP calculations, streak algorithm)