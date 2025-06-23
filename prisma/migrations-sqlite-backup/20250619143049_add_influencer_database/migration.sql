-- CreateTable
CREATE TABLE "influencer_database" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "influencer_database_instagramUsername_key" ON "influencer_database"("instagramUsername");
