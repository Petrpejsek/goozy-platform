-- CreateTable
CREATE TABLE "scraping_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countries" TEXT NOT NULL,
    "minFollowers" INTEGER NOT NULL DEFAULT 3000,
    "maxFollowers" INTEGER NOT NULL DEFAULT 500000,
    "platforms" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scraping_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "scraping_runs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "scraping_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "influencer_prospects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapingRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "country" TEXT,
    "instagramData" TEXT,
    "tiktokData" TEXT,
    "youtubeData" TEXT,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "duplicateOf" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "influencer_prospects_scrapingRunId_fkey" FOREIGN KEY ("scrapingRunId") REFERENCES "scraping_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "influencer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "location" TEXT,
    "audienceAgeGroups" TEXT,
    "audienceGenders" TEXT,
    "audienceCountries" TEXT,
    "avgReach" INTEGER,
    "avgComments" INTEGER,
    "avgStoryViews" INTEGER,
    "clickThroughRate" REAL,
    "contentCategories" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "influencer_profiles_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "influencer_profiles_influencerId_key" ON "influencer_profiles"("influencerId");
