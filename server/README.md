# ApplyWise — Backend

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in real values (get `DATABASE_URL` from Neon).
3. `npx prisma migrate dev --name init` — creates all tables from `prisma/schema.prisma`
4. `npm run dev` — starts the dev server on the port set in `.env`

## Folder structure

```
src/
  config/       env validation, prisma client singleton
  middleware/   security, auth, validation, error handling
  routes/       route definitions (URL → controller mapping)
  controllers/  request handling logic
  validators/   Zod schemas for input validation
  utils/        logger, token helpers, error class, async wrapper
prisma/
  schema.prisma database schema
```

## Security measures implemented so far
- Helmet (security headers)
- CORS allowlist (no wildcard origins)
- Rate limiting (general + strict on auth routes)
- HPP protection (parameter pollution)
- bcrypt password hashing (cost factor 12)
- JWT access + refresh tokens, refresh token rotation, hashed refresh tokens in DB
- httpOnly/secure/sameSite cookies for refresh tokens
- Account lockout after 5 failed login attempts (15 min cooldown)
- Strict Zod input validation on every endpoint
- Centralized error handling — no stack traces or internals leaked in production
- Generic auth error messages (no account enumeration)
