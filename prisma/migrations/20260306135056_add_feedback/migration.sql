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
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
