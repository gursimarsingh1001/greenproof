# GreenProof

GreenProof is a hackathon-ready web app that helps people spot possible greenwashing on consumer products.

It works like a fact-checker for sustainability claims:
- scan or search a product
- extract claims like `organic`, `fair trade`, or `eco-friendly`
- verify available certification and brand evidence
- generate an explainable trust score
- suggest better alternatives when claims look weak

## What It Does

- Barcode scan and manual product search
- Claim extraction with deterministic sustainability patterns
- Certification-aware trust scoring
- Explainable penalties, bonuses, and recommendations
- Better-product alternatives in the same category
- Brand reputation context
- Open Food Facts fallback for real food/barcode scans
- Integrity verification using stored SHA-256 report hashes
- Registry of official certification source databases for fashion, cosmetics, and household products

## What It Is Not

- Not a 100% truth detector
- Not a legal certification authority
- Not a full supply-chain traceability platform
- Not a digital-signature system

## Current Stack

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
- SQLite for local development
- Zod

## Demo-Ready Features

- Search `organic t shirt` and get a seeded apparel product with image and price
- Scan or search low-trust products and view explainable issues
- Verify report integrity with a display id and hash comparison
- Explore certification-source coverage through the API

## Local Setup

### 1. Backend

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:generate
npm run db:seed
npm run start:api
```

Backend runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment Files

### Backend `.env`

The root `.env.example` includes:
- `DATABASE_URL`
- `NODE_ENV`
- `PORT`
- `OPEN_FOOD_FACTS_BASE_URL`
- optional placeholders for future external APIs

### Frontend `.env.local`

The frontend `.env.example` includes:
- `GREENPROOF_API_BASE_URL`

## Useful Commands

### Backend checks

```bash
npm run typecheck
npm run test:seed-data
npm run test:engine
npm run test:api
npm run test:integrity
```

### Frontend checks

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
  -d "{\"query\":\"organic t shirt\"}"
```

### Inspect certification sources

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

GreenProof stores a SHA-256 hash of each canonical report payload and can later check whether a submitted report still matches the stored record.

What this gives:
- tamper-evident report verification
- replayable audit-style evidence for demos and disputes
- stable hash comparison for stored analyses

What it does **not** give:
- digital signing
- immutable storage
- cryptographic proof of authorship

## Real Data Notes

- Seeded non-food products are the primary demo catalog
- Open Food Facts is used as a real-data fallback for food lookups
- Imported food products are scored conservatively when eco-evidence is weak or missing

## Limitations

- Scores are based on available evidence, not absolute truth
- Brand reputation and some brand flags are curated demo data
- Generic food products often have less sustainability evidence than apparel, beauty, or cleaning products
- Certification-source registry is stored, but full certification-company ingestion is still a future enhancement

## Recommended Demo Searches

- `organic t shirt`
- `eco t shirt`
- `Patagonia Organic Cotton Hoodie`
- `Seventh Generation Dish Soap`
- `FastFashionX Eco Collection Basic Tee`

## Notes For Public Repo Readers

- Screenshots are not included in the repo yet
- This project is optimized for hackathon demos and explainability
- The scoring engine is intentionally rule-based first so users can understand why a score changed

## License

MIT
