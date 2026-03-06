-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER,
    "roadmapSlug" TEXT,
    "phaseId" TEXT,
    "topicId" TEXT,
    "pagePath" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "feedback_type_createdAt_idx" ON "feedback"("type", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_roadmapSlug_phaseId_topicId_idx" ON "feedback"("roadmapSlug", "phaseId", "topicId");
