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

Contributions, issues, and feature requests are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
