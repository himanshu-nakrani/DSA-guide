-- CreateTable
CREATE TABLE "UserArticleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserArticleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserArticleProgress_userId_articleId_key" ON "UserArticleProgress"("userId", "articleId");

-- CreateIndex
CREATE INDEX "UserArticleProgress_userId_readAt_idx" ON "UserArticleProgress"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "UserArticleProgress" ADD CONSTRAINT "UserArticleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArticleProgress" ADD CONSTRAINT "UserArticleProgress_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
