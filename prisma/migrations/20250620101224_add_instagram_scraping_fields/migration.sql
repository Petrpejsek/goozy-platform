-- AlterTable
ALTER TABLE "scraping_attempts" ADD COLUMN "targetProfileId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_scraping_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'google_search',
    "sourceFilter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "scraping_runs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "scraping_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_scraping_runs" ("completedAt", "configId", "errors", "id", "startedAt", "status", "totalFound", "totalProcessed") SELECT "completedAt", "configId", "errors", "id", "startedAt", "status", "totalFound", "totalProcessed" FROM "scraping_runs";
DROP TABLE "scraping_runs";
ALTER TABLE "new_scraping_runs" RENAME TO "scraping_runs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
