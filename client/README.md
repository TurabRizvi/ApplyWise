# ApplyWise — Client

## Setup
1. `npm install`
2. Copy `.env.local.example` to `.env.local` (points at your local backend on port 5000)
3. `npm run dev` — runs on http://localhost:3000

## Phase 1 (this delivery)
- Landing page (`app/page.tsx`)
- Login page (`app/login/page.tsx`) — Candidate/Recruiter tabs
- Register page (`app/register/page.tsx`) — Candidate/Recruiter tabs
- Design system: `app/globals.css` + `tailwind.config.ts` (dark/light theme tokens)
- Shared UI primitives: `components/ui/*`
- Auth: `lib/auth-context.tsx` (in-memory access token, matches backend security design) + `lib/api.ts`

## Not yet built (Phase 2 / 3)
- `/candidate` portal (dashboard, resumes, AI features, tracker, profile)
- `/hr` portal (screening batches, ranked candidates, comparison)

Login/register will redirect to `/candidate` or `/hr` on success — these routes don't exist yet, so you'll see a 404 until Phase 2/3 are built. This is expected.
