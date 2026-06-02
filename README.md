# DSA Guide

A structured DSA learning platform with topic articles sourced from verified references.

## Prerequisites
- Node 20+
- PostgreSQL (Neon, Supabase, or local), with `DATABASE_URL` in `.env`

## Setup
```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Structure
- `prisma/content/articles/` — article markdown files, seeded into the DB.
- `src/app/learn/` — article index and reader.
- `src/app/roadmap/` — curriculum view.
- `src/app/problems/` — placeholder for MVP2.
