/*
  Warnings:

  - You are about to drop the column `followers` on the `influencer_applications` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_influencer_applications" ("bio", "categories", "collaborationTypes", "createdAt", "email", "id", "instagram", "name", "notes", "password", "status", "tiktok", "updatedAt", "youtube") SELECT "bio", "categories", "collaborationTypes", "createdAt", "email", "id", "instagram", "name", "notes", "password", "status", "tiktok", "updatedAt", "youtube" FROM "influencer_applications";
DROP TABLE "influencer_applications";
ALTER TABLE "new_influencer_applications" RENAME TO "influencer_applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
