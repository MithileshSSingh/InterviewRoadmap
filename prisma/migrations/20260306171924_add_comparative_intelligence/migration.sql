-- CreateTable
CREATE TABLE "comparisons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "priority" TEXT,
    "location" TEXT,
    "experienceLevel" TEXT,
    "currentRole" TEXT,
    "yearsOfExperience" INTEGER,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "shareToken" TEXT,
    "result" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastRefreshedAt" DATETIME,
    CONSTRAINT "comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comparison_targets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comparisonId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "label" TEXT NOT NULL,
    "normalizedRole" TEXT,
    "normalizedCompany" TEXT,
    "location" TEXT,
    "experienceLevel" TEXT,
    "inputPayload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comparison_targets_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comparison_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comparisonId" TEXT NOT NULL,
    "runType" TEXT NOT NULL DEFAULT 'initial',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "log" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comparison_runs_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comparison_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comparisonId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comparison_snapshots_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comparison_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comparisonId" TEXT NOT NULL,
    "targetId" TEXT,
    "dimensionKey" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT,
    "sourceType" TEXT,
    "publishedAt" DATETIME,
    "accessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trustScore" INTEGER,
    "freshnessScore" INTEGER,
    "notes" TEXT,
    CONSTRAINT "comparison_sources_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comparison_sources_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "comparison_targets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_shareToken_key" ON "comparisons"("shareToken");

-- CreateIndex
CREATE INDEX "comparisons_sessionId_idx" ON "comparisons"("sessionId");

-- CreateIndex
CREATE INDEX "comparisons_userId_idx" ON "comparisons"("userId");

-- CreateIndex
CREATE INDEX "comparisons_status_idx" ON "comparisons"("status");

-- CreateIndex
CREATE INDEX "comparison_targets_comparisonId_idx" ON "comparison_targets"("comparisonId");

-- CreateIndex
CREATE UNIQUE INDEX "comparison_targets_comparisonId_side_key" ON "comparison_targets"("comparisonId", "side");

-- CreateIndex
CREATE INDEX "comparison_runs_comparisonId_idx" ON "comparison_runs"("comparisonId");

-- CreateIndex
CREATE INDEX "comparison_snapshots_comparisonId_createdAt_idx" ON "comparison_snapshots"("comparisonId", "createdAt");

-- CreateIndex
CREATE INDEX "comparison_sources_comparisonId_idx" ON "comparison_sources"("comparisonId");

-- CreateIndex
CREATE INDEX "comparison_sources_targetId_idx" ON "comparison_sources"("targetId");
