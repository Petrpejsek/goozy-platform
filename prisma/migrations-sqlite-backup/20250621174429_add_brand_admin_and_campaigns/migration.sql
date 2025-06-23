-- AlterTable
ALTER TABLE "products" ADD COLUMN "brand_name" TEXT;
ALTER TABLE "products" ADD COLUMN "dimensions" TEXT;
ALTER TABLE "products" ADD COLUMN "gender" TEXT;
ALTER TABLE "products" ADD COLUMN "material" TEXT;
ALTER TABLE "products" ADD COLUMN "weight" REAL;

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "targetCountries" TEXT NOT NULL,
    "targetGender" TEXT,
    "targetCategories" TEXT,
    "influencerIds" TEXT NOT NULL,
    "expectedReach" INTEGER,
    "budgetAllocated" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "campaigns_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_brands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetCountries" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_brands" ("createdAt", "description", "email", "id", "isActive", "isApproved", "logo", "name", "phone", "updatedAt", "website") SELECT "createdAt", "description", "email", "id", "isActive", "isApproved", "logo", "name", "phone", "updatedAt", "website" FROM "brands";
DROP TABLE "brands";
ALTER TABLE "new_brands" RENAME TO "brands";
CREATE UNIQUE INDEX "brands_email_key" ON "brands"("email");
CREATE TABLE "new_scraping_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapingRunId" TEXT NOT NULL,
    "targetProfileId" TEXT,
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
    CONSTRAINT "scraping_attempts_scrapingRunId_fkey" FOREIGN KEY ("scrapingRunId") REFERENCES "scraping_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "scraping_attempts_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "influencer_database" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_scraping_attempts" ("attemptedAt", "country", "duration", "errorMessage", "id", "platform", "profileUrl", "prospectId", "scrapedData", "scrapingRunId", "status", "targetProfileId", "username") SELECT "attemptedAt", "country", "duration", "errorMessage", "id", "platform", "profileUrl", "prospectId", "scrapedData", "scrapingRunId", "status", "targetProfileId", "username" FROM "scraping_attempts";
DROP TABLE "scraping_attempts";
ALTER TABLE "new_scraping_attempts" RENAME TO "scraping_attempts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
