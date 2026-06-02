-- CreateEnum
CREATE TYPE "ArticleLevel" AS ENUM ('FOUNDATION', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "level" "ArticleLevel" NOT NULL,
    "order" INTEGER NOT NULL,
    "contentMd" TEXT NOT NULL,
    "references" JSONB NOT NULL,
    "prerequisites" JSONB,
    "estimatedMins" INTEGER NOT NULL DEFAULT 10,
    "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_topicId_level_order_idx" ON "Article"("topicId", "level", "order");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
