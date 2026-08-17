# ApplyWise

**AI-powered resumes for candidates. AI-powered screening for recruiters.**

🔗 **Live:** [apply-wise-nine.vercel.app](https://apply-wise-nine.vercel.app) 

ApplyWise is a full-stack career platform with two independent portals: candidates build ATS-friendly resumes and get AI-driven feedback, rewrites, interview prep, and cover letters — while recruiters bulk-screen and rank candidate resumes against a job description using the same AI scoring engine. There's no shared job board between the two sides; each portal is a complete, self-contained tool.

Built as a solo full-stack internship project (Node.js/Express/Prisma backend, Next.js/React frontend), with Google Gemini powering every AI feature.

---

## Features

### For Candidates
- **Resume Builder** — build a resume section by section (education, experience, projects, skills, certifications, languages), or upload an existing PDF
- **PDF Export** — download any resume as a formatted PDF, generated entirely client-side
- **AI ATS Analyzer** — ATS compatibility score broken down by formatting, keywords, grammar, and action verbs, with specific suggestions
- **AI Rewrite** — an ATS-optimized rewrite of your resume, plus a summary of what changed
- **AI Interview Prep** — technical, HR, and coding questions generated from your actual resume content, not generic question banks
- **AI Cover Letter Generator** — tailored cover letters from a company, job title, and job description, with full history
- **Application Tracker** — Kanban-style board through a status pipeline (Wishlist → Applied → Assessment → Interview → Offer → Accepted/Rejected)
- **Dashboard** — live stats, a real Resume Score gauge from your latest ATS analysis, and a Recent Activity feed
- **AI Assistant** — a guided in-app helper scoped to explaining ApplyWise's own features — it won't answer unrelated questions

### For Recruiters (HR Portal)
- **Screening Batches** — create a batch from a job title + job description
- **Bulk Resume Upload** — up to 20 resumes at once; one bad file never blocks the rest of the batch
- **AI Screening & Ranking** — every resume scored and ranked automatically against the job description
- **Candidate Comparison** — compare shortlisted candidates side by side (score, matched skills, gaps)
- **Dashboard** — batch/candidate stats plus a real score-distribution chart across the org
- **Team Management** — an org admin can add/deactivate recruiters
- **HR AI Assistant** — same guided-help pattern, scoped to HR-only features

### Admin Panel
- Platform-wide stats, candidate/organization moderation (view, deactivate, delete), resume moderation — admin accounts are provisioned directly in the database, with no public self-registration endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, React Hook Form, Zod, Recharts, @react-pdf/renderer |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT (access + refresh token rotation), bcrypt |
| File Storage | Cloudinary |
| AI | Google Gemini API (gemini-3.5-flash) |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

## Security

- Password hashing with bcrypt, account lockout after repeated failed logins
- JWT access/refresh token rotation, refresh tokens stored as hashes (never plaintext) in httpOnly, secure, cross-domain-safe cookies
- Strict Zod input validation on every endpoint
- Ownership checks on every resource (a user can never access another user's resume, application, or an HR org's screening data)
- Rate limiting (general + a stricter limit on auth routes), Helmet security headers, CORS allowlist, HPP protection
- Centralized error handling — no stack traces or internal details ever reach the client in production

---

## Project Structure

```
ApplyWise/
├── server/     — Express + TypeScript + Prisma backend
└── client/     — Next.js + TypeScript frontend
```

## Getting Started

### Backend
```bash
cd server
npm install
# copy .env.example to .env and fill in DATABASE_URL, JWT secrets, Gemini/Cloudinary keys
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd client
npm install
# copy .env.local.example to .env.local
npm run dev
```

Locally, the frontend runs on `http://localhost:3000`, the backend on `http://localhost:5000`.

---

## Known Limitations

- No email service configured — HR team invites create accounts directly rather than sending real invite links
- No drag-and-drop on the application tracker (status changes via dropdown)
- Render's free tier spins down when idle — first request after inactivity can take 30-50s
- No systematic end-to-end test suite — testing was manual throughout development

## Status

Deployed and functional. Backend and frontend (candidate portal, HR portal, admin panel) are complete.

## Author

Syed Mohammad Turab Rizvi
Intern ID: ZYNVEX-CERT-0671
