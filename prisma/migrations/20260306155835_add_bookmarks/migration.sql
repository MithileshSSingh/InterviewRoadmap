-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "phaseTitle" TEXT NOT NULL,
    "roadmapTitle" TEXT NOT NULL,
    "roadmapEmoji" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "bookmarks_sessionId_idx" ON "bookmarks"("sessionId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_sessionId_slug_phaseId_topicId_key" ON "bookmarks"("sessionId", "slug", "phaseId", "topicId");
