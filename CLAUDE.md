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
- TypeScript config uses `"module": "NodeNext"` and outputs `.js` files

### Client Architecture (React SPA)
```
client/src/
├── pages/           # Route components (Landing, Login, Register, Levels, Tasks, Profile, etc.)
├── components/      # Reusable UI (header, navigation, modals)
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom React hooks (useAuth, useUser, etc.)
└── lib/             # Client utilities (queryClient, API helpers, tasks.ts)
```

**Key Patterns**:
- **Routing**: Wouter (`Switch`, `Route`, `useLocation`)
- **Data Fetching**: TanStack Query with custom hooks
- **State**: React Query cache + component state (no Redux/Zustand)
- **Styling**: Tailwind CSS with `@/` path alias
- **Auth**: Supabase Auth with session-based fallback via `useAuth()` hook

**Page Structure**:
- `Landing.tsx` — Marketing landing page
- `Login.tsx` / `Register.tsx` — Supabase Auth with email/password migration support
- `levels.tsx` — Main training interface with 8-level growth path system
- `tasks.tsx` — Daily training tasks interface
- `profile.tsx` — User profile with stats and progress tracking
- `training.tsx` — System training (30-day curriculum)
- `growth.tsx` — Growth path visualization
- `diary.tsx` — Training diary with AI insights
- `ranking.tsx` — Leaderboard

### Server Architecture (Express + Serverless)
```
server/
├── index.ts              # createApp() — Express setup, middleware, error handler
├── devServer.ts          # Development entry point
├── routes.ts             # API route definitions (registerRoutes)
├── auth.ts               # Supabase Auth integration, session management, demo mode
├── storage.ts            # Database operation interface (Drizzle)
├── db.ts                 # Database connection (Neon/Vercel Postgres/Supabase)
├── experienceSystem.ts   # EXP calculation, level-up logic
├── adaptiveLearning.ts   # Exercise progression engine
├── openai.ts             # AI feedback generation (GPT-4o)
├── imageAnalyzer.ts      # Exercise validation via AI vision
├── dailyCourses.ts       # 30-day structured curriculum data
├── passwordService.ts    # Password hashing for legacy auth
├── supabaseAdmin.ts      # Supabase Admin client for migrations
└── migrateAuth.ts        # Auth migration utilities
```

**Key Patterns**:
- **API Design**: RESTful with Zod validation, JSON responses
- **Auth Flow**:
  - Primary: Supabase Auth with JWT tokens (stateless, serverless-compatible)
  - JWT tokens stored in localStorage: `supabase_access_token`, `supabase_refresh_token`
  - Server validates JWT via `Authorization: Bearer <token>` header
  - Fallback: Session-based auth for legacy users (MemoryStore in production)
  - Migration: Automatic migration from password-based to Supabase Auth on login
  - `isAuthenticated` middleware protects routes (JWT first, then session)
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
- Defines: users, trainingSessions, diaryEntries, tasks, feedbacks, trainingPrograms, etc.
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
- Primary key: `id` (varchar, supports both Replit IDs and Supabase UUIDs)
- **Auth fields**:
  - `email` — User email (unique)
  - `passwordHash` — Legacy bcrypt password (cleared after Supabase migration)
  - `supabaseUserId` — UUID linking to Supabase auth.users.id
  - `migratedToSupabase` — Boolean flag tracking migration status
- **Profile fields**: firstName, lastName, profileImageUrl, username
- **Progress tracking**: level, exp, streak, totalDays, completedTasks, totalTime
- **Sequential progression**:
  - `currentLevel` (1-8) — Current training level
  - `currentExercise` — Next exercise to complete
  - `completedExercises` (JSONB) — Per-level completion counts: `{ "1": 3, "2": 0 }`
- **System training**: `currentDay` (1-30) — Progress in 30-day curriculum

### trainingSessions
- Records completed exercises with duration, rating, feedback
- Links to user and training program
- Drives experience calculation and streak logic

### trainingPrograms
- 30-day structured curriculum (三个月一杆清台训练系统)
- 8 skill levels from beginner to master
- Contains: title, description, videoUrl, requirements, ballPatterns

### diaryEntries
- User training reflections with optional images
- AI-generated insights via OpenAI

### sessions
- Express session storage for legacy auth
- Used during transition period before full Supabase migration

## Experience System Logic

**EXP Calculation** (server/experienceSystem.ts):
- Guided training: base + duration bonus + rating bonus
- Custom training: duration × 2 + rating bonus
- Special training: duration × 1.5 + rating bonus
- Completion bonus: +20 EXP
- Level thresholds increase exponentially (8 levels total)

**Training Streak** (server/routes.ts):
- Calculated from actual completed sessions (not calendar days)
- Current streak: consecutive days from today/yesterday
- Tracks 7-day activity pattern for UI visualization
- Encouragement messages based on streak milestones

## Authentication System

### Current State: Dual Auth System
The application supports both Supabase Auth and legacy session-based auth during migration period.

**Primary Flow (Supabase Auth)**:
1. User registers/logs in via Supabase Auth
2. Client receives JWT token
3. Server validates token and creates/updates user record
4. User is linked via `supabaseUserId`

**Migration Flow**:
1. Legacy user logs in with email/password
2. Server validates password hash
3. Automatic migration to Supabase Auth
4. Password hash cleared, `migratedToSupabase` set to true
5. User receives Supabase JWT for future requests

**JWT Token Flow** (Stateless Auth):
1. User logs in → Client receives JWT tokens from Supabase
2. Tokens saved to localStorage: `supabase_access_token`, `supabase_refresh_token`
3. Client includes `Authorization: Bearer <token>` header in all API requests
4. Server's `isAuthenticated` middleware validates JWT via Supabase Admin client
5. If JWT valid → creates `SessionUser` and attaches to `req.user`
6. If JWT invalid → falls back to session-based auth

**Demo Mode**:
- Set `AUTH_DISABLED=true` for local testing
- Uses hardcoded `demoUserProfile` from `server/auth.ts`
- Bypasses all authentication checks

## Key API Endpoints

### Auth
- `POST /api/auth/user` — Get current user (Supabase or session-based)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/migrate-login` — Login with automatic Supabase migration
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
# Database - Use Supabase Session Pooler (IPv4 compatible)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Supabase Auth
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Session & AI
SESSION_SECRET=random-string       # Session encryption key
OPENAI_API_KEY=sk-...             # GPT-4o access

# Auth Mode
AUTH_DISABLED=false                # Set to true for local demo mode

NODE_ENV=development|production
```

**Critical Database Connection Notes**:
- **Use Session Pooler, NOT Transaction Pooler**: Transaction pooler may not support PREPARE statements
- **Session Pooler format**: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
- **Vercel environment updates**: After changing env vars in Vercel dashboard, you MUST trigger a manual redeploy or push new code

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

**Important**: TanStack Query's default `queryFn` in `queryClient.ts` automatically adds JWT Authorization headers. If you create custom `queryFn`, you must manually add headers:

```typescript
// Add getAuthHeaders() helper for custom fetch calls
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

// Use in custom queryFn
queryFn: async () => {
  const response = await fetch('/api/endpoint', {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return response.json();
}
```

### Image Upload Flow
1. Client uploads to `/api/upload` (multer middleware)
2. Development: Saved to `uploads/` directory
3. Production: Should use Vercel Blob (requires `BLOB_READ_WRITE_TOKEN`)
4. Returns `{ url: "/uploads/filename.jpg" }` or Blob URL

## Growth Path System

The application uses an 8-level growth path system (三个月一杆清台成长路径):

1. **Level 1-2**: Basic fundamentals (stance, grip, aim)
2. **Level 3-4**: Ball control and positioning
3. **Level 5-6**: Advanced techniques (english, masse)
4. **Level 7-8**: Master level (strategic play, competition)

**Sequential Progression**:
- Users must complete exercises in order within each level
- Unlocking next level requires completing all exercises in current level
- Progress tracked via `currentLevel`, `currentExercise`, and `completedExercises`

## Data Source Unification (Updated 2025-11-17)

**Critical**: The application uses a unified data architecture to ensure consistency across all pages.

### Ability Scores System

**Single Source of Truth**: All ability scores must be fetched from `/api/v1/dashboard/summary`

**Unified Hook** (`client/src/hooks/useAbilityScores.ts`):
```typescript
import { useAbilityScores } from '@/hooks/useAbilityScores';

// Correct: Use unified hook
const { data: scores } = useAbilityScores();
console.log(scores?.accuracy, scores?.clearance); // camelCase fields
```

**Deprecated Patterns** (Do NOT use):
```typescript
// ❌ WRONG: Old hook with userId parameter
import { useAbilityScoresForProfile } from '@/hooks/useAbilityScoresForProfile';
const { data } = useAbilityScoresForProfile(userId); // DEPRECATED

// ❌ WRONG: snake_case field names
scores?.accuracy_score // DEPRECATED, use scores?.accuracy

// ❌ WRONG: Deprecated API endpoint
fetch(`/api/users/${userId}/ability-scores`) // DEPRECATED
```

**Field Naming Convention**: All ability scores use **camelCase**:
- `accuracy` (准度分)
- `spin` (杆法分)
- `positioning` (走位分)
- `power` (发力分)
- `strategy` (策略分)
- `clearance` (清台能力总分)

### Training Streak System

**Unified Calculation**: Streak endpoint (`/api/user/streak`) automatically merges data from:
1. Skills Library system (`training_sessions` table)
2. 90-Day Challenge system (`ninety_day_training_records` table)

**Implementation** (`server/routes.ts:233`):
- Fetches from both training systems
- Merges into unified session list
- Calculates current/longest streak
- Returns recent 7-day activity

### Best Practices

1. **Single Hook Per Data Type**: Use only one hook for each data type (e.g., `useAbilityScores()`)
2. **No Fallback Logic**: Avoid `data1 || data2` patterns that cause race conditions
3. **Unified Cache Keys**: Related data shares same queryKey prefix
4. **camelCase Fields**: All API responses use camelCase for consistency
5. **Deprecation Warnings**: Check console for deprecated API warnings

### Migration from Legacy Code

If you encounter deprecated code:

```typescript
// Before (DEPRECATED)
import { useAbilityScoresForProfile } from '@/hooks/useAbilityScoresForProfile';
const { data: scores } = useAbilityScoresForProfile(user?.id);
const accuracyScore = scores?.accuracy_score;

// After (CORRECT)
import { useAbilityScores } from '@/hooks/useAbilityScores';
const { data: scores } = useAbilityScores();
const accuracyScore = scores?.accuracy;
```

## Testing Checklist

Since automated tests are minimal, manually verify:
- [ ] `npm run check` passes (TypeScript)
- [ ] `npm run build` succeeds
- [ ] Core flows work after changes:
  - Register new user via Supabase Auth
  - Login via Supabase Auth or legacy migration
  - Complete training session
  - View AI feedback
  - Check experience/level update
  - View streak calculation
  - Growth path progression
  - **Ability scores consistent across all pages**
  - **90-day challenge training counts toward streak**
- [ ] Server logs show no errors on key operations
- [ ] Database schema pushes without conflicts
- [ ] **No deprecated API warnings in console**

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
   - Useful for local testing without Supabase setup

5. **Experience Calculation**: Triggered automatically on session POST
   - Don't manually update `exp`/`level` fields
   - Use `recalculateUserExperience()` to rebuild from sessions

6. **Training Progression**: Sequential unlock system
   - Users must complete exercises in order within each level
   - `currentExercise` tracks next unlocked exercise
   - `completedExercises` JSONB tracks per-level completion counts

7. **Supabase Auth Migration**:
   - Legacy users automatically migrate on first login
   - Password hash is cleared after migration
   - `migratedToSupabase` flag prevents double migration
   - Migration happens transparently in `/api/auth/migrate-login`

8. **JWT Authentication in Custom Hooks**:
   - Default `queryClient` automatically includes JWT headers
   - Custom `queryFn` must manually add Authorization headers
   - See examples in `useSkillsV3.ts` and `useDailyGoals.ts`
   - Always include `credentials: 'include'` for session fallback

9. **Session Store in Production**:
   - Uses MemoryStore (not database) to avoid connection pool exhaustion
   - Sessions don't persist across serverless cold starts
   - Primary authentication relies on JWT tokens in localStorage
   - Database session store disabled to prevent Supabase pooler issues

## Production Deployment (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables (DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY, Supabase keys)
4. Build command: `npm run build` (default)
5. Output directory: `dist/public` (configured in vercel.json)
6. API routes: Automatically handled by `api/index.ts`

**First Deploy Checklist**:
- [ ] Database schema pushed (`npm run db:push` locally first)
- [ ] Environment variables set in Vercel dashboard
- [ ] Supabase project configured with proper RLS policies
- [ ] Test login flow (Supabase Auth)
- [ ] Verify API routes work (`/api/auth/user`)
- [ ] Check serverless function logs for errors
- [ ] Test legacy user migration flow

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
- **Comments**: Explain complex logic (especially EXP calculations, streak algorithm, auth migration)
- **Chinese UI**: All user-facing text should be in Chinese (Simplified)

## Legacy Code Notes

The codebase contains several legacy page variants that should generally be avoided:
- `tasks-debug.tsx`, `tasks-simple.tsx`, `tasks-working.tsx`, `tasks-fixed.tsx`, `tasks-minimal.tsx`, `tasks-stable.tsx`

These were used during development/debugging. Use `tasks.tsx` for the canonical tasks page implementation.

## Branding (Updated 2025-11-17)

**Core Brand**: "三个月一杆清台" (Three Months to Clear the Table)

The application is branded as "三个月一杆清台" throughout the UI. This is the primary and only brand name - there is no subtitle or secondary brand name.

**Brand Guidelines**:
- Use "三个月一杆清台" in all page titles, headers, and navigation
- HTML title: `三个月一杆清台 - 台球训练系统`
- Do NOT use "耶氏台球" or "Ye's Billiards" (deprecated branding)
- When adding new features or pages, maintain consistent branding in Chinese text
- SEO keywords: 台球训练, 台球教学, 90天挑战, 清台能力, 台球技巧
