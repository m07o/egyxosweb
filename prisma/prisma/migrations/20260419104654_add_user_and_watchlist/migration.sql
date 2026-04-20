/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContinueWatching` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Episode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScrapeLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScraperConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Season` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SiteSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Watchlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Account";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ContinueWatching";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Episode";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Link";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Movie";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Notification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Profile";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Review";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScrapeLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ScraperConfig";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Season";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Server";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SiteSettings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscription";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserRequest";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Watchlist";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "movies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "slug" TEXT NOT NULL,
    "overview" TEXT,
    "poster_url" TEXT,
    "backdrop_url" TEXT,
    "release_year" INTEGER,
    "quality" TEXT NOT NULL DEFAULT '720p',
    "rating" REAL DEFAULT 0,
    "mediaType" TEXT NOT NULL DEFAULT 'movie',
    "site" TEXT NOT NULL,
    "site_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "movie_id" TEXT NOT NULL,
    "server_name" TEXT NOT NULL DEFAULT 'Server 1',
    "linkType" TEXT NOT NULL DEFAULT 'stream',
    "quality" TEXT NOT NULL DEFAULT '720p',
    "url" TEXT NOT NULL,
    "size" TEXT,
    "season" INTEGER,
    "episode" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT DEFAULT 'ar',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "links_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scraper_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site_id" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cron_expr" TEXT,
    "max_pages" INTEGER NOT NULL DEFAULT 5,
    "delay_ms" INTEGER NOT NULL DEFAULT 2000,
    "last_run_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scrape_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "config_id" TEXT,
    "site" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pages_scraped" INTEGER NOT NULL DEFAULT 0,
    "movies_found" INTEGER NOT NULL DEFAULT 0,
    "links_found" INTEGER NOT NULL DEFAULT 0,
    "links_new" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" DATETIME
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT DEFAULT 'https://placehold.co/100x100/1a1a2e/10b981?text=U',
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "site_name" TEXT NOT NULL DEFAULT 'سينما بلس',
    "site_description" TEXT NOT NULL DEFAULT 'مشاهدة وتحميل أفلام ومسلسلات',
    "logo_url" TEXT NOT NULL DEFAULT '',
    "hero_auto_play" BOOLEAN NOT NULL DEFAULT true,
    "hero_interval" INTEGER NOT NULL DEFAULT 7,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "custom_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdb_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "arabic_title" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "streaming_servers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");

-- CreateIndex
CREATE INDEX "movies_mediaType_idx" ON "movies"("mediaType");

-- CreateIndex
CREATE INDEX "movies_site_idx" ON "movies"("site");

-- CreateIndex
CREATE INDEX "movies_is_published_idx" ON "movies"("is_published");

-- CreateIndex
CREATE INDEX "movies_created_at_idx" ON "movies"("created_at");

-- CreateIndex
CREATE INDEX "links_movie_id_idx" ON "links"("movie_id");

-- CreateIndex
CREATE INDEX "links_linkType_idx" ON "links"("linkType");

-- CreateIndex
CREATE INDEX "links_quality_idx" ON "links"("quality");

-- CreateIndex
CREATE INDEX "links_is_active_idx" ON "links"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "scraper_configs_site_id_key" ON "scraper_configs"("site_id");

-- CreateIndex
CREATE INDEX "scrape_logs_site_idx" ON "scrape_logs"("site");

-- CreateIndex
CREATE INDEX "scrape_logs_status_idx" ON "scrape_logs"("status");

-- CreateIndex
CREATE INDEX "scrape_logs_started_at_idx" ON "scrape_logs"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "watchlists_user_id_idx" ON "watchlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_link_id_key" ON "watchlists"("user_id", "link_id");
