# Contributing to DSA Guide

Thanks for taking the time to contribute. This file is the quick-reference version — the full guidelines are in [README.md](../README.md#-contributing).

## Quick start

```bash
git clone https://github.com/himanshu-nakrani/DSA-guide.git
cd DSA-guide
npm install
cp .env.example .env   # add your DATABASE_URL
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Before you open a PR

- Run `npm run lint` — CI will fail without it.
- For content changes, make sure the article renders at `http://localhost:3000/learn`.
- Link the issue your PR addresses in the PR description (`Closes #123`).

## Commit style

```
feat: add binary search article
fix: correct off-by-one in merge sort example
docs: update contributing guide
```

## Need help?

Open a [discussion](https://github.com/himanshu-nakrani/DSA-guide/discussions) or comment on the relevant issue.
