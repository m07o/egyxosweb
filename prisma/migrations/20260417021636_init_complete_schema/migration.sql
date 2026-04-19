-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "arabicTitle" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "overview" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "backdropUrl" TEXT NOT NULL DEFAULT '',
    "genre" TEXT NOT NULL DEFAULT '[]',
    "country" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "rating" REAL NOT NULL DEFAULT 0,
    "imdbId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MOVIE',
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movieId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Season_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "overview" TEXT NOT NULL DEFAULT '',
    "posterUrl" TEXT NOT NULL DEFAULT '',
    "airDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movieId" TEXT,
    "episodeId" TEXT,
    "serverName" TEXT NOT NULL DEFAULT 'سيرفر 1',
    "url" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "linkType" TEXT NOT NULL DEFAULT 'WATCH',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Link_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Link_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScraperConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "targetUrl" TEXT NOT NULL,
    "cssSelectors" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cronSchedule" TEXT NOT NULL DEFAULT '0 */6 * * *',
    "lastRunAt" DATETIME,
    "lastStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scraperConfigId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "extractedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScrapeLog_scraperConfigId_fkey" FOREIGN KEY ("scraperConfigId") REFERENCES "ScraperConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movieName" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "requestType" TEXT NOT NULL DEFAULT 'REQUEST_MOVIE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'Cinema+',
    "siteNameAr" TEXT NOT NULL DEFAULT 'سينما بلس',
    "siteDescription" TEXT NOT NULL DEFAULT 'مشاهدة وتحميل أفلام ومسلسلات بجودة عالية',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "faviconUrl" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "telegramUrl" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "heroAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "heroInterval" INTEGER NOT NULL DEFAULT 7,
    "moviesPerPage" INTEGER NOT NULL DEFAULT 20,
    "seoTitle" TEXT NOT NULL DEFAULT 'سينما بلس - مشاهدة وتحميل أفلام ومسلسلات',
    "seoDescription" TEXT NOT NULL DEFAULT 'أفضل موقع عربي لمشاهدة وتحميل الأفلام والمسلسلات بجودة عالية',
    "seoKeywords" TEXT NOT NULL DEFAULT 'أفلام, مسلسلات, مشاهدة, تحميل, عربي',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'tv',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_type_idx" ON "Movie"("type");

-- CreateIndex
CREATE INDEX "Movie_isFeatured_idx" ON "Movie"("isFeatured");

-- CreateIndex
CREATE INDEX "Movie_isActive_idx" ON "Movie"("isActive");

-- CreateIndex
CREATE INDEX "Movie_createdAt_idx" ON "Movie"("createdAt");

-- CreateIndex
CREATE INDEX "Season_movieId_idx" ON "Season"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_movieId_number_key" ON "Season"("movieId", "number");

-- CreateIndex
CREATE INDEX "Episode_seasonId_idx" ON "Episode"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_number_key" ON "Episode"("seasonId", "number");

-- CreateIndex
CREATE INDEX "Link_movieId_idx" ON "Link"("movieId");

-- CreateIndex
CREATE INDEX "Link_episodeId_idx" ON "Link"("episodeId");

-- CreateIndex
CREATE INDEX "Link_status_idx" ON "Link"("status");

-- CreateIndex
CREATE INDEX "Link_linkType_idx" ON "Link"("linkType");

-- CreateIndex
CREATE INDEX "ScraperConfig_isActive_idx" ON "ScraperConfig"("isActive");

-- CreateIndex
CREATE INDEX "ScrapeLog_scraperConfigId_idx" ON "ScrapeLog"("scraperConfigId");

-- CreateIndex
CREATE INDEX "ScrapeLog_createdAt_idx" ON "ScrapeLog"("createdAt");

-- CreateIndex
CREATE INDEX "UserRequest_requestType_idx" ON "UserRequest"("requestType");

-- CreateIndex
CREATE INDEX "UserRequest_status_idx" ON "UserRequest"("status");

-- CreateIndex
CREATE INDEX "UserRequest_createdAt_idx" ON "UserRequest"("createdAt");
