-- CreateTable
CREATE TABLE "scraping_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapingRunId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "scrapedData" TEXT,
    "prospectId" TEXT,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    CONSTRAINT "scraping_attempts_scrapingRunId_fkey" FOREIGN KEY ("scrapingRunId") REFERENCES "scraping_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
