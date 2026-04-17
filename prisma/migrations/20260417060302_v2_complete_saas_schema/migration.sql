/*
  Warnings:

  - You are about to drop the column `arabicTitle` on the `Movie` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "isKids" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'ar',
    "maturityRating" TEXT NOT NULL DEFAULT 'all',
    "autoplayNext" BOOLEAN NOT NULL DEFAULT true,
    "autoplayPreview" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCheckoutUrl" TEXT,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL DEFAULT '',
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" TEXT NOT NULL DEFAULT '[]',
    "maxQuality" TEXT NOT NULL DEFAULT '720p',
    "maxScreens" INTEGER NOT NULL DEFAULT 1,
    "maxProfiles" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "isSpoiler" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "movieId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watchlist_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watchlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContinueWatching" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "movieId" TEXT NOT NULL,
    "episodeId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "lastWatched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContinueWatching_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContinueWatching_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContinueWatching_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContinueWatching_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "overview" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "airDate" DATETIME,
    "runtime" INTEGER NOT NULL DEFAULT 0,
    "introStart" INTEGER,
    "introEnd" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Episode" ("airDate", "createdAt", "id", "number", "overview", "posterUrl", "seasonId", "title") SELECT "airDate", "createdAt", "id", "number", "overview", "posterUrl", "seasonId", "title" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
CREATE INDEX "Episode_seasonId_idx" ON "Episode"("seasonId");
CREATE UNIQUE INDEX "Episode_seasonId_number_key" ON "Episode"("seasonId", "number");
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movieId" TEXT,
    "episodeId" TEXT,
    "serverName" TEXT NOT NULL DEFAULT 'سيرفر 1',
    "url" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "linkType" TEXT NOT NULL DEFAULT 'WATCH',
    "format" TEXT NOT NULL DEFAULT 'HLS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "requiresPremium" BOOLEAN NOT NULL DEFAULT false,
    "subtitleUrl" TEXT NOT NULL DEFAULT '',
    "subtitleLang" TEXT NOT NULL DEFAULT 'ar',
    "sizeMb" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Link_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Link_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("createdAt", "episodeId", "id", "linkType", "movieId", "quality", "serverName", "status", "url") SELECT "createdAt", "episodeId", "id", "linkType", "movieId", "quality", "serverName", "status", "url" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE INDEX "Link_movieId_idx" ON "Link"("movieId");
CREATE INDEX "Link_episodeId_idx" ON "Link"("episodeId");
CREATE INDEX "Link_status_idx" ON "Link"("status");
CREATE INDEX "Link_linkType_idx" ON "Link"("linkType");
CREATE INDEX "Link_requiresPremium_idx" ON "Link"("requiresPremium");
CREATE TABLE "new_Movie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL DEFAULT '',
    "overview" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "backdropUrl" TEXT NOT NULL DEFAULT '',
    "trailerUrl" TEXT NOT NULL DEFAULT '',
    "genre" TEXT NOT NULL DEFAULT '[]',
    "country" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "rating" REAL NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "imdbId" TEXT,
    "runtime" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'MOVIE',
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'TMDB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Movie" ("backdropUrl", "country", "createdAt", "genre", "id", "imdbId", "isActive", "isExclusive", "isFeatured", "overview", "posterUrl", "quality", "rating", "title", "tmdbId", "type", "updatedAt", "year") SELECT "backdropUrl", "country", "createdAt", "genre", "id", "imdbId", "isActive", "isExclusive", "isFeatured", "overview", "posterUrl", "quality", "rating", "title", "tmdbId", "type", "updatedAt", "year" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");
CREATE INDEX "Movie_type_idx" ON "Movie"("type");
CREATE INDEX "Movie_isFeatured_idx" ON "Movie"("isFeatured");
CREATE INDEX "Movie_isPremium_idx" ON "Movie"("isPremium");
CREATE INDEX "Movie_isActive_idx" ON "Movie"("isActive");
CREATE INDEX "Movie_createdAt_idx" ON "Movie"("createdAt");
CREATE INDEX "Movie_year_idx" ON "Movie"("year");
CREATE INDEX "Movie_rating_idx" ON "Movie"("rating");
CREATE TABLE "new_ScrapeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scraperConfigId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "extractedCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "errorStack" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScrapeLog_scraperConfigId_fkey" FOREIGN KEY ("scraperConfigId") REFERENCES "ScraperConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScrapeLog" ("createdAt", "duration", "errorMessage", "extractedCount", "id", "scraperConfigId", "status") SELECT "createdAt", "duration", "errorMessage", "extractedCount", "id", "scraperConfigId", "status" FROM "ScrapeLog";
DROP TABLE "ScrapeLog";
ALTER TABLE "new_ScrapeLog" RENAME TO "ScrapeLog";
CREATE INDEX "ScrapeLog_scraperConfigId_idx" ON "ScrapeLog"("scraperConfigId");
CREATE INDEX "ScrapeLog_status_idx" ON "ScrapeLog"("status");
CREATE INDEX "ScrapeLog_createdAt_idx" ON "ScrapeLog"("createdAt");
CREATE TABLE "new_ScraperConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "targetUrl" TEXT NOT NULL,
    "cssSelectors" TEXT NOT NULL DEFAULT '{}',
    "headers" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cronSchedule" TEXT NOT NULL DEFAULT '0 */6 * * *',
    "lastRunAt" DATETIME,
    "lastStatus" TEXT,
    "totalExtracted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ScraperConfig" ("createdAt", "cronSchedule", "cssSelectors", "description", "id", "isActive", "lastRunAt", "lastStatus", "name", "targetUrl", "updatedAt") SELECT "createdAt", "cronSchedule", "cssSelectors", "description", "id", "isActive", "lastRunAt", "lastStatus", "name", "targetUrl", "updatedAt" FROM "ScraperConfig";
DROP TABLE "ScraperConfig";
ALTER TABLE "new_ScraperConfig" RENAME TO "ScraperConfig";
CREATE INDEX "ScraperConfig_isActive_idx" ON "ScraperConfig"("isActive");
CREATE INDEX "ScraperConfig_lastStatus_idx" ON "ScraperConfig"("lastStatus");
CREATE TABLE "new_Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movieId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "overview" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "airDate" DATETIME,
    "episodeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Season_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Season" ("createdAt", "id", "movieId", "number", "posterUrl", "title") SELECT "createdAt", "id", "movieId", "number", "posterUrl", "title" FROM "Season";
DROP TABLE "Season";
ALTER TABLE "new_Season" RENAME TO "Season";
CREATE INDEX "Season_movieId_idx" ON "Season"("movieId");
CREATE UNIQUE INDEX "Season_movieId_number_key" ON "Season"("movieId", "number");
CREATE TABLE "new_Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'tv',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'WATCH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Server" ("baseUrl", "createdAt", "icon", "id", "isActive", "name", "order") SELECT "baseUrl", "createdAt", "icon", "id", "isActive", "name", "order" FROM "Server";
DROP TABLE "Server";
ALTER TABLE "new_Server" RENAME TO "Server";
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'Cinema+',
    "siteNameAr" TEXT NOT NULL DEFAULT 'سينما بلس',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "faviconUrl" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "telegramUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "twitterUrl" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoKeywords" TEXT NOT NULL DEFAULT '',
    "heroAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "heroInterval" INTEGER NOT NULL DEFAULT 7,
    "moviesPerPage" INTEGER NOT NULL DEFAULT 20,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'ar',
    "pwaName" TEXT NOT NULL DEFAULT 'Cinema+',
    "pwaShortName" TEXT NOT NULL DEFAULT 'Cinema+',
    "pwaDescription" TEXT NOT NULL DEFAULT '',
    "pwaThemeColor" TEXT NOT NULL DEFAULT '#e50914',
    "pwaBgColor" TEXT NOT NULL DEFAULT '#0a0a0f',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("contactEmail", "facebookUrl", "faviconUrl", "heroAutoPlay", "heroInterval", "id", "instagramUrl", "logoUrl", "moviesPerPage", "seoDescription", "seoKeywords", "seoTitle", "siteDescription", "siteName", "siteNameAr", "telegramUrl", "updatedAt") SELECT "contactEmail", "facebookUrl", "faviconUrl", "heroAutoPlay", "heroInterval", "id", "instagramUrl", "logoUrl", "moviesPerPage", "seoDescription", "seoKeywords", "seoTitle", "siteDescription", "siteName", "siteNameAr", "telegramUrl", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'ar',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_slug_idx" ON "SubscriptionPlan"("slug");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_order_idx" ON "SubscriptionPlan"("order");

-- CreateIndex
CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_movieId_key" ON "Review"("userId", "movieId");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "Watchlist_profileId_idx" ON "Watchlist"("profileId");

-- CreateIndex
CREATE INDEX "Watchlist_movieId_idx" ON "Watchlist"("movieId");

-- CreateIndex
CREATE INDEX "Watchlist_isPublic_idx" ON "Watchlist"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_profileId_movieId_key" ON "Watchlist"("userId", "profileId", "movieId");

-- CreateIndex
CREATE INDEX "ContinueWatching_userId_idx" ON "ContinueWatching"("userId");

-- CreateIndex
CREATE INDEX "ContinueWatching_profileId_idx" ON "ContinueWatching"("profileId");

-- CreateIndex
CREATE INDEX "ContinueWatching_movieId_idx" ON "ContinueWatching"("movieId");

-- CreateIndex
CREATE INDEX "ContinueWatching_lastWatched_idx" ON "ContinueWatching"("lastWatched");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
