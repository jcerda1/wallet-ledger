# wallet-ledger

Wallet Ledger Service (Node.js + TypeScript)

Stack: NestJS, Prisma, PostgreSQL (Supabase), GitHub Actions, Railway

Short description:
A ledger-based wallet service that tracks user credits and purchases. All money values are stored as integer cents. The service uses x-user-id header to scope user requests.

How to run locally:
1. Install deps: npm ci
2. Set DATABASE_URL in .env
3. Generate Prisma client: npx prisma generate
4. Run migrations: npx prisma migrate dev
5. Start: npm run start:dev

License: MIT