# NexaRise MLM Platform

NexaRise is a high-performance Next.js Multi-Level Marketing (MLM) platform built with App Router, TypeScript, Prisma ORM, and Tailwind CSS.

---

## 🌟 Key Features

- **Dual Wallet Architecture**: Separate `Main Wallet` (withdrawals/earnings) and `P2P Wallet` (account activations & transfers) with $0 fee internal transfers.
- **Daily Self ROI Engine**: Daily ROI automation (default 1.0%/day) distributed to active user investments.
- **11-Level Commission Plan**: Dynamic downline ROI commission distribution up to 11 levels (`30%, 20%, 10%, 5%, 5%, 5%, 5%, 2.5%, 2.5%, 2.5%, 2.5%`) with active sponsor investment verification.
- **Rank Milestone Rewards**: 4-Rank achievement system (`Silver`, `Gold`, `Platinum`, `Diamond`) based on a strict **50/50 two-leg business volume qualification rule**.
- **Genealogy & Team Tracking**: Tree and List downline visualization, direct referral business statistics, and referral link generation.
- **6-Digit Transaction PIN & Security**: Separate 6-digit Transaction PIN for sensitive financial operations, bcrypt password hashing, and anti-enumeration auth endpoints.
- **Admin Management Portal**: Real-time business statistics, user account status management, deposit/withdrawal approvals with refund handling, and configurable business plan settings.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database ORM**: Prisma ORM with `@prisma/adapter-pg` (PostgreSQL connection pooler compatible)
- **Styling**: Tailwind CSS & Lucide React icons
- **Math Precision**: `Decimal.js` for financial arithmetic
- **Authentication**: Custom JWT session tokens (`jose`) & `bcryptjs` password hashing

---

## 🚀 Local Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/vinayaksahu/nexarise-mlm.git
   cd nexarise-mlm
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/nexarise"
   DIRECT_URL="postgresql://user:password@localhost:5432/nexarise"
   JWT_SECRET="your-secure-jwt-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Run Database Migrations & Prisma Generation**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Configure the following environment variables in Vercel (`Settings -> Environment Variables`):
   - `DATABASE_URL`: Production PostgreSQL database connection string (Neon / Supabase / AWS RDS / Railway).
   - `DIRECT_URL`: Direct PostgreSQL connection string for Prisma migrations (if using PgBouncer).
   - `JWT_SECRET`: Secure random string for JWT signing.
   - `NEXT_PUBLIC_APP_URL`: Production domain URL (e.g. `https://nexarise.com`).
4. Click **Deploy**.

---

## 🛡️ License

Private & Proprietary - NexaRise Platform.
