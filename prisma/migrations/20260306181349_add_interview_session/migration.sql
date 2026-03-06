-- DropIndex
DROP INDEX "comparison_snapshots_comparisonId_createdAt_idx";

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "roadmapSlug" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "score" REAL,
    "summary" TEXT,
    "messages" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "interview_sessions_sessionId_idx" ON "interview_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "interview_sessions_userId_idx" ON "interview_sessions"("userId");

-- CreateIndex
CREATE INDEX "comparison_snapshots_comparisonId_idx" ON "comparison_snapshots"("comparisonId");
