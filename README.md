<div align="center">
  <h1>DSA Guide</h1>
  <p>A structured path from DSA basics to interview-ready.</p>

  <img src="public/images/screenshot.png" alt="DSA Guide preview" width="720" />

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL" />
  </p>
</div>

---

## Features

- **Guided curriculum** — topic-based learning path from fundamentals to advanced patterns.
- **Verified references** — articles sourced from trusted textbooks and resources.
- **Interactive reading** — Markdown/MDX articles rendered with syntax highlighting and math.
- **Progress-aware roadmap** — always shows the next best step to learn.
- **Modern stack** — Next.js App Router, React 19, Tailwind CSS, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend**: React 19, Tailwind CSS v4, Zustand, shadcn/ui, Base UI
- **Backend & Database**: PostgreSQL (Neon), Prisma ORM
- **Content**: Markdown/MDX with `remark-gfm`, `remark-math`, and `rehype-highlight`
- **Testing**: Vitest

## Quick Start

> Requires **Node.js 20+** and a PostgreSQL database.

```bash
# 1. Clone the repository
git clone https://github.com/himanshu-nakrani/DSA-guide.git
cd DSA-guide

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file and set DATABASE_URL
# DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# 4. Set up the database
npx prisma migrate dev
npm run db:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
prisma/
  content/articles/   # Markdown articles, seeded into the database
  schema.prisma       # Database schema
src/
  app/
    learn/            # Article index and reading interface
    roadmap/          # Curriculum view and learning pathways
    problems/         # Coding practice arena (in progress)
  components/         # Reusable UI components
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |
| `npm run db:seed` | Seed the database with content from `prisma/content` |

## Contributing

Contributions are welcome — from typo fixes and article improvements to new features.

1. Check existing [issues](https://github.com/himanshu-nakrani/DSA-guide/issues) before opening a new one.
2. For non-trivial changes, open an issue to discuss the approach first.
3. Create a focused branch, keep commits descriptive, and run `npm run lint` before pushing.
4. Open a pull request against `main` with a short summary of what and why.

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Roadmap

See [`DSA_PLATFORM_PRODUCT_SPEC.md`](./DSA_PLATFORM_PRODUCT_SPEC.md) for the product vision and upcoming milestones.

## Security

If you discover a security vulnerability, please do not open a public issue — email the maintainer directly.

## License

Distributed under the [MIT License](./LICENSE).
