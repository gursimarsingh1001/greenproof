# GreenProof

GreenProof is an explainable greenwashing-detection app for consumer products. It scans or searches a product, checks available certification evidence and brand context, and returns a trust score with a clear explanation instead of a black-box verdict.

## What GreenProof Does

- Scan a barcode with the camera
- Upload a barcode photo when live camera access is not convenient
- Search products manually by name
- Extract sustainability-style claims such as `organic`, `fair trade`, or `natural`
- Separate product-level evidence from weaker brand-level evidence
- Show trust score, issues found, better alternatives, and report integrity status
- Use Open Food Facts as a fallback for real food barcode lookups
- Track official certification-source coverage for cosmetics, household, and fashion

## How It Works

1. Resolve the product from barcode or manual query
2. Load product, brand, and cached official evidence from the local database
3. Extract claims and compare them with certifications, vague terms, contradictions, and brand context
4. Generate an explainable trust score and alternatives
5. Store a SHA-256 fingerprint of the generated report for later integrity verification

## Current Local Database Rollout

The local certification-database rollout is ahead of the currently deployed demo and is being built in `C:\greenproof` without changing the live Vercel app.

Current local state as of **April 22, 2026**:

- `68` seeded catalog products
- `66` official evidence rows
- `45` products with verified official evidence
- `25` brands with verified official evidence
- `23` certification sources in the registry
- `12` supported source connectors covered in the local rollout
- `100%` supported-source coverage in the current local database pass
- `23/23` official-source snapshot files refreshed locally

Examples of currently represented source families:

- `MADE SAFE`
- `Leaping Bunny`
- `USDA Organic`
- `COSMOS / Ecocert`
- `EWG Verified`
- `EPA Safer Choice`
- `Green Seal`
- `ECOLOGO`
- `GOTS`
- `OEKO-TEX`
- `Fair Trade Textile`
- `GRS`
- `B Corp`
- `bluesign`
- `Better Cotton`
- `NSF`
- `DfE`
- `PETA Cruelty-Free`

Important note:
- this is a real DB-first rollout, but full bulk ingestion across every official directory is still in progress
- current local coverage mixes seeded products, official evidence rows, and connector/matching infrastructure

## Tech Stack

### Frontend

- Next.js App Router
- React
- Tailwind CSS
- Zustand
- `@zxing/library`
- Recharts
- Lucide React

### Backend

- Node.js
- TypeScript
- Express
- Prisma
- Zod
- SQLite for quick local/demo fallback
- Postgres-first workflow for the official-certification rollout

## Repository Structure

- `frontend/` - Next.js frontend
- `frontend/src/app` - pages and route handlers
- `frontend/src/components` - UI components
- `src/api` - Express routes and API services
- `src/engine` - scoring, explanations, claim extraction, alternatives
- `src/lib` - database helpers, seed data, official evidence seeds
- `src/cli` - coverage and ingestion commands
- `prisma/` - Prisma schema, migrations, seed logic
- `tests/` - backend verification and regression tests

## Local Setup

### 1. Backend install

```bash
npm install
cp .env.example .env
```

### 2. Choose a database mode

#### Quick local mode: SQLite

Edit `.env` and use:

```env
DATABASE_URL="file:./dev.db"
GREENPROOF_DB_PROVIDER="sqlite"
```

Then run:

```bash
npm run db:migrate
npm run db:seed
```

#### Official-evidence rollout mode: Postgres

Start local Postgres:

```bash
npm run db:postgres:start
```

The default `.env.example` already points to:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/greenproof?schema=public"
GREENPROOF_DB_PROVIDER="postgresql"
GREENPROOF_POSTGRES_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/greenproof?schema=public"
```

Then run:

```bash
npm run db:postgres:push
npm run db:postgres:seed
```

### 3. Start the backend

```bash
npm run start:api
```

Backend runs on `http://localhost:4000`.

### 4. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Useful Commands

### Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:coverage
npm run db:postgres:start
npm run db:postgres:stop
npm run db:postgres:reset
npm run db:postgres:push
npm run db:postgres:seed
npm run db:postgres:coverage
npm run db:postgres:test:api
npm run db:postgres:test:ingestion
```

### Ingestion and coverage

```bash
npm run ingest:all
npm run ingest:sector
npm run ingest:source
```

### Verification

```bash
npm run typecheck
npm run test:seed-data
npm run test:engine
npm run test:ingestion
npm run test:api
npm run test:integrity
```

### Frontend

```bash
cd frontend
npm run typecheck
npm run build
```

## Main API Endpoints

- `POST /api/scan`
- `GET /api/product/:id`
- `GET /api/brand/:id/reputation`
- `GET /api/certifications`
- `GET /api/certification-sources`
- `GET /api/stats`
- `POST /api/feedback`
- `POST /api/verify-integrity`

## Example Requests

### Search a product

```bash
curl -X POST http://localhost:4000/api/scan \
  -H "content-type: application/json" \
  -d "{\"query\":\"Mamaearth Vitamin C Face Wash\"}"
```

### Scan a barcode by value

```bash
curl -X POST http://localhost:4000/api/scan \
  -H "content-type: application/json" \
  -d "{\"barcode\":\"8901000000132\"}"
```

### Inspect certification-source coverage

```bash
curl http://localhost:4000/api/certification-sources
```

### Verify report integrity

```bash
curl -X POST http://localhost:4000/api/verify-integrity \
  -H "content-type: application/json" \
  -d @verify-request.json
```

## Integrity Verification

GreenProof stores a SHA-256 fingerprint of each canonical report payload and can later compare a submitted report against the stored fingerprint.

What this gives:

- tamper-evident report verification
- stable report replay checks
- stronger demo trust when showing generated scores

What it does not give:

- digital signatures
- immutable storage
- cryptographic proof of authorship

## Recommended Demo Searches

- `Mamaearth Vitamin C Face Wash`
- `Mamaearth Onion Shampoo`
- `No Nasties Blanc Classic Tee`
- `The Better Home Dishwash Liquid`
- `ATTITUDE Window & Glass Cleaner`
- `Patanjali Kesh Kanti Natural Hair Cleanser`

## Current Limitations

- Scores are based on available evidence, not absolute truth
- Normal product-photo understanding is not the main flow yet; barcode and manual search are the primary inputs
- Brand reputation still includes curated demo signals
- Food lookups rely on Open Food Facts when a seeded match is not available
- The official-source rollout is real, but full bulk ingestion across every listed source is still being expanded

## License

MIT
