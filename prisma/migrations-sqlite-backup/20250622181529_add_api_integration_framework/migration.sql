-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "suppliers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplier_api_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "connectionName" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT,
    "webhookUrl" TEXT,
    "authType" TEXT NOT NULL DEFAULT 'api_key',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestAt" DATETIME,
    "lastTestStatus" TEXT,
    "lastTestError" TEXT,
    "capabilities" TEXT NOT NULL,
    "configuration" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "supplier_api_connections_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "productsChecked" INTEGER NOT NULL DEFAULT 0,
    "productsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "responseTime" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "inventory_logs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_logs_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "supplier_api_connections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "submissionMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextRetryAt" DATETIME,
    "responseData" TEXT,
    "errorMessage" TEXT,
    "submittedData" TEXT NOT NULL,
    CONSTRAINT "order_submissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_submissions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_submissions_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "supplier_api_connections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_mappings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "supplierSku" TEXT,
    "variantMapping" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_mappings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_mappings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "supplierId" TEXT,
    "brandId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "api_notifications_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "api_notifications_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_influencer_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "instagram" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "facebook" TEXT,
    "categories" TEXT NOT NULL,
    "bio" TEXT,
    "collaborationTypes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "possibleDuplicateIds" TEXT,
    "mergeStatus" TEXT NOT NULL DEFAULT 'none',
    "mergeData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_influencer_applications" ("bio", "categories", "collaborationTypes", "createdAt", "email", "facebook", "id", "instagram", "name", "notes", "password", "status", "tiktok", "updatedAt", "youtube") SELECT "bio", "categories", "collaborationTypes", "createdAt", "email", "facebook", "id", "instagram", "name", "notes", "password", "status", "tiktok", "updatedAt", "youtube" FROM "influencer_applications";
DROP TABLE "influencer_applications";
ALTER TABLE "new_influencer_applications" RENAME TO "influencer_applications";
CREATE TABLE "new_influencer_database" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "country" TEXT,
    "location" TEXT,
    "instagramUsername" TEXT,
    "instagramUrl" TEXT,
    "instagramData" TEXT,
    "tiktokUsername" TEXT,
    "tiktokUrl" TEXT,
    "tiktokData" TEXT,
    "youtubeChannel" TEXT,
    "youtubeUrl" TEXT,
    "youtubeData" TEXT,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "sourceHashtags" TEXT,
    "sourceCountry" TEXT,
    "foundBy" TEXT,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "hasEmail" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastScrapedAt" DATETIME,
    "notes" TEXT,
    "promotionStatus" TEXT NOT NULL DEFAULT 'none',
    "promotedToProspectIds" TEXT,
    "promotedToInfluencerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_influencer_database" ("avatar", "avgComments", "avgLikes", "bio", "country", "createdAt", "email", "engagementRate", "foundBy", "hasEmail", "id", "instagramData", "instagramUrl", "instagramUsername", "isActive", "isValidated", "lastScrapedAt", "location", "name", "notes", "sourceCountry", "sourceHashtags", "tiktokData", "tiktokUrl", "tiktokUsername", "totalFollowers", "updatedAt", "username", "youtubeChannel", "youtubeData", "youtubeUrl") SELECT "avatar", "avgComments", "avgLikes", "bio", "country", "createdAt", "email", "engagementRate", "foundBy", "hasEmail", "id", "instagramData", "instagramUrl", "instagramUsername", "isActive", "isValidated", "lastScrapedAt", "location", "name", "notes", "sourceCountry", "sourceHashtags", "tiktokData", "tiktokUrl", "tiktokUsername", "totalFollowers", "updatedAt", "username", "youtubeChannel", "youtubeData", "youtubeUrl" FROM "influencer_database";
DROP TABLE "influencer_database";
ALTER TABLE "new_influencer_database" RENAME TO "influencer_database";
CREATE UNIQUE INDEX "influencer_database_instagramUsername_key" ON "influencer_database"("instagramUsername");
CREATE TABLE "new_influencer_prospects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapingRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "country" TEXT,
    "instagramUsername" TEXT,
    "instagramUrl" TEXT,
    "tiktokUsername" TEXT,
    "tiktokUrl" TEXT,
    "youtubeChannel" TEXT,
    "youtubeUrl" TEXT,
    "instagramData" TEXT,
    "tiktokData" TEXT,
    "youtubeData" TEXT,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "duplicateOf" TEXT,
    "duplicateReason" TEXT,
    "notes" TEXT,
    "originDatabaseId" TEXT,
    "promotionStatus" TEXT NOT NULL DEFAULT 'none',
    "promotedToInfluencerId" TEXT,
    "promotedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "influencer_prospects_scrapingRunId_fkey" FOREIGN KEY ("scrapingRunId") REFERENCES "scraping_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_influencer_prospects" ("avatar", "avgComments", "avgLikes", "bio", "country", "createdAt", "duplicateOf", "duplicateReason", "email", "engagementRate", "id", "instagramData", "instagramUrl", "instagramUsername", "name", "notes", "scrapingRunId", "status", "tiktokData", "tiktokUrl", "tiktokUsername", "totalFollowers", "updatedAt", "youtubeChannel", "youtubeData", "youtubeUrl") SELECT "avatar", "avgComments", "avgLikes", "bio", "country", "createdAt", "duplicateOf", "duplicateReason", "email", "engagementRate", "id", "instagramData", "instagramUrl", "instagramUsername", "name", "notes", "scrapingRunId", "status", "tiktokData", "tiktokUrl", "tiktokUsername", "totalFollowers", "updatedAt", "youtubeChannel", "youtubeData", "youtubeUrl" FROM "influencer_prospects";
DROP TABLE "influencer_prospects";
ALTER TABLE "new_influencer_prospects" RENAME TO "influencer_prospects";
CREATE TABLE "new_influencers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" REAL NOT NULL DEFAULT 0.1,
    "originType" TEXT,
    "originProspectId" TEXT,
    "originApplicationId" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'pending',
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_influencers" ("avatar", "bio", "commissionRate", "createdAt", "email", "id", "isActive", "isApproved", "name", "password", "phone", "slug", "updatedAt") SELECT "avatar", "bio", "commissionRate", "createdAt", "email", "id", "isActive", "isApproved", "name", "password", "phone", "slug", "updatedAt" FROM "influencers";
DROP TABLE "influencers";
ALTER TABLE "new_influencers" RENAME TO "influencers";
CREATE UNIQUE INDEX "influencers_email_key" ON "influencers"("email");
CREATE UNIQUE INDEX "influencers_slug_key" ON "influencers"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "product_mappings_productId_supplierId_key" ON "product_mappings"("productId", "supplierId");
