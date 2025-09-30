# Repository Guidelines

## Project Structure & Module Organization
React code lives in `client/src`, with `components/`, `pages/`, `hooks/`, `lib/`, and `data/` providing the UI stack; import with `@/...`. Express services sit in `server/`, where `routes.ts` wires feature modules like `adaptiveLearning.ts` and `openai.ts`. Shared Drizzle models are in `shared/schema.ts`. Static assessments stay in `assessments/`; runtime uploads land in `uploads/` and stay out of Git.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start the Express API with the Vite client on `http://localhost:5000`.
- `npm run build` — bundle the SPA and server into `dist/`.
- `npm run start` — serve the production build from `dist/`.
- `npm run check` — run the strict TypeScript compiler.
- `npm run db:push` — push schema changes defined in `shared/schema.ts` via Drizzle.

## Coding Style & Naming
Stick with TypeScript strictness; favor explicit return types on exported helpers. Use two-space indentation, double-quoted imports, and Tailwind utilities for styling. Components, pages, and providers are PascalCase (`FeedbackModal.tsx`); hooks are camelCase and prefixed with `use`; server utilities follow descriptive camelCase filenames. Leverage the configured path aliases `@/...` and `@shared/...` instead of relative traversals.

## Testing Guidelines
Automated tests are not yet established, so treat `npm run check` plus targeted manual verification as the baseline before opening a PR. Exercise core flows—authenticate via Replit OAuth, complete a training session, inspect AI feedback, and confirm streak data—to catch regressions. Watch the server console for `/api` log output. If you add automated coverage, colocate `.test.ts` or `.test.tsx` files beside the feature and keep them excluded from production builds.

## Commit & Pull Request Guidelines
History favors short, imperative subjects such as “Improve user login persistence”; keep the tense consistent and scope each commit narrowly. Reference issues or database impacts in the body when relevant. PRs should outline user-facing changes, list validation steps (commands run, manual checks), and include screenshots or sample JSON whenever UI or API responses change. Call out new environment variables or required `npm run db:push` migrations.

## Environment & Security Notes
Provide the following secrets through `.env` or the hosting dashboard: `OPENAI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `REPLIT_DOMAINS`, `REPL_ID`, and `ISSUER_URL`. Example:
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgres://...
```
Do not commit credentials or generated media inside `uploads/`. Redact tokens and user identifiers before sharing logs or error payloads.
