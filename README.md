# DSA Guide

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-7.8.0-1B222D?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

A structured Data Structures and Algorithms (DSA) learning and coding practice platform. DSA Guide takes learners from basics to interview-ready through guided roadmaps, topic-first teaching, pattern recognition, and browser-based coding practice.

Inspired by the strongest parts of established platforms, this application is built to provide clarity of path—always showing the learner the next best step.

---

## 🎯 Features

- **Guided Roadmaps**: Topic-based learning path from basics to advanced.
- **Pattern Recognition**: Focus on understanding why a pattern works.
- **Interactive Articles**: Markdown-based articles synced with a robust database schema.
- **Progress Tracking**: Visible progression by topic and difficulty.
- **Modern Tech Stack**: Built with Next.js App Router, React 19, Tailwind CSS, Prisma, and PostgreSQL.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS v4, Zustand, Shadcn UI, Base UI
- **Backend & Database**: PostgreSQL (Neon Serverless), Prisma ORM
- **Content**: Markdown/MDX with `remark-gfm`

---

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 20 or higher.
- **Database**: PostgreSQL (Neon, Supabase, or local).

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/himanshu-nakrani/DSA-guide.git
cd DSA-guide
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your database URL:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

### 4. Database Setup

Run the migrations to set up the database schema and seed the initial article data:

```bash
npx prisma migrate dev
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

- `prisma/content/articles/` — Markdown files for articles, automatically seeded into the database.
- `src/app/learn/` — Article index and reading interface.
- `src/app/roadmap/` — Curriculum view and learning pathways.
- `src/app/problems/` — Placeholder for the coding practice arena (MVP2).

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Generates Prisma client and builds the Next.js application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Lints the codebase using ESLint.
- `npm run db:seed` - Seeds the database with content from `prisma/content`.

---

## 🤝 Contributing

Contributions are welcome — whether that's fixing a typo, improving an article, adding a new problem, or building a full feature.

### Getting started

1. **Fork** the repository and clone your fork locally.
2. **Check existing issues** before opening a new one — your problem or idea may already be tracked.
3. **Open an issue first** for any non-trivial change so we can discuss the approach before you invest time coding it.

### Submitting a pull request

1. Create a focused branch from `main`:
   ```bash
   git checkout -b fix/typo-in-arrays-article
   # or
   git checkout -b feat/add-sliding-window-problems
   ```
2. Keep commits small and descriptive — one logical change per commit.
3. Follow the existing code style (ESLint is enforced on CI — run `npm run lint` locally before pushing).
4. Open a PR against `main` with a short summary of *what* and *why*.
5. A maintainer will review and give feedback within a few days.

### What to contribute

- **Content**: New articles, problem descriptions, or corrections in `prisma/content/articles/`.
- **Features**: Enhancements to the roadmap, progress tracking, or the reading interface.
- **Bugs**: Anything broken — file an issue with steps to reproduce, or open a PR with a fix.
- **Accessibility & performance**: Always welcome.

### Commit style

Use conventional commits where possible:

```
feat: add heap topic articles
fix: correct time complexity in binary search article
docs: update README with OSS guidelines
style: fix lint warnings in roadmap component
```

---

## 🌐 Community & OSS

DSA Guide is fully open source under the **MIT License** — use it, fork it, build on it.

### Reporting issues

- Search [open issues](https://github.com/himanshu-nakrani/DSA-guide/issues) first.
- Include your OS, Node.js version, and steps to reproduce when filing a bug.
- For security vulnerabilities, please **do not** open a public issue — email the maintainer directly.

### Code of conduct

This project follows a simple rule: be kind and constructive. Disrespectful or hostile behaviour will not be tolerated.

### Roadmap

See [`DSA_PLATFORM_PRODUCT_SPEC.md`](./DSA_PLATFORM_PRODUCT_SPEC.md) for the product vision and upcoming milestones. If you want to pick up a planned feature, comment on the relevant issue and it will be assigned to you.

---

## 📄 License

Distributed under the [MIT License](./LICENSE).
