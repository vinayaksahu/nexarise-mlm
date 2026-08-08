# NexaRise Deployment

## Target Environment
- **Platform**: Vercel
- **Database**: PostgreSQL (e.g. Supabase, Vercel Postgres)
- **Node Environment**: Node.js 18.x or 20.x

## CI/CD Workflow
- GitHub is the source of truth.
- Pushes to the `main` branch trigger a Vercel deployment.
- Database migrations run during the build step via Prisma (`npx prisma migrate deploy`).

## Environment Variables
- `DATABASE_URL` (PostgreSQL connection string)
- `NEXTAUTH_SECRET` (Secure JWT secret)
- `NEXTAUTH_URL` (Public URL)
- `CRON_SECRET` (For securing Vercel Cron endpoints)

## Cron Jobs
- Daily execution via `vercel.json` crons configured to hit an API route `POST /api/cron/daily-roi`.
- Secured via Bearer token matching `CRON_SECRET`.
