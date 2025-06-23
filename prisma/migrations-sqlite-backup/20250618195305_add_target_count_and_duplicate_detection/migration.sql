-- AlterTable
ALTER TABLE "influencer_prospects" ADD COLUMN "duplicateReason" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "instagramUsername" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "tiktokUrl" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "tiktokUsername" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "youtubeChannel" TEXT;
ALTER TABLE "influencer_prospects" ADD COLUMN "youtubeUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_scraping_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countries" TEXT NOT NULL,
    "minFollowers" INTEGER NOT NULL DEFAULT 3000,
    "maxFollowers" INTEGER NOT NULL DEFAULT 500000,
    "platforms" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_scraping_configs" ("countries", "createdAt", "id", "isActive", "lastRunAt", "maxFollowers", "minFollowers", "name", "platforms", "updatedAt") SELECT "countries", "createdAt", "id", "isActive", "lastRunAt", "maxFollowers", "minFollowers", "name", "platforms", "updatedAt" FROM "scraping_configs";
DROP TABLE "scraping_configs";
ALTER TABLE "new_scraping_configs" RENAME TO "scraping_configs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
