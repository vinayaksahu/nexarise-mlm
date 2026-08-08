# NexaRise Architecture

## Core Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Lucide icons
- **Language**: TypeScript
- **Backend API**: Next.js Server Actions / API Routes
- **Database**: PostgreSQL (Supabase or Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (or custom JWT with HttpOnly cookies if preferred for lightweight setup)
- **Hosting**: Vercel

## System Components
1. **Web Client (Frontend)**: Responsive React application for Users and Admins.
2. **API/Server Actions**: Handles business logic, DB interactions, and authentication.
3. **Database Layer**: PostgreSQL with Prisma schemas.
4. **Scheduled Tasks (Cron)**: Vercel Cron for daily ROI calculation and reward processing.

## Key Design Principles
- **Simple Architecture**: Minimal dependencies.
- **Service-Based Logic**: encapsulate financial logic (e.g. `RoiService`, `LevelIncomeService`).
- **Idempotency**: All financial operations use unique reference keys.
- **Precision**: Money is stored as `DECIMAL(20,8)` in the database.
