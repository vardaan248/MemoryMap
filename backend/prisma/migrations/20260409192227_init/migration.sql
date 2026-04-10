-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('AMAZING', 'HAPPY', 'NEUTRAL', 'TIRED', 'CHALLENGED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "googleId" TEXT,
    "passwordHash" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "totalCountries" INTEGER NOT NULL DEFAULT 0,
    "totalPhotos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "countries" TEXT[],
    "cities" TEXT[],
    "entryCount" INTEGER NOT NULL DEFAULT 0,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_tags" (
    "tripId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "trip_tags_pkey" PRIMARY KEY ("tripId","tagId")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "mood" "Mood",
    "weather" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "locationName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "takenAt" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "trips_slug_key" ON "trips"("slug");

-- CreateIndex
CREATE INDEX "trips_userId_idx" ON "trips"("userId");

-- CreateIndex
CREATE INDEX "trips_slug_idx" ON "trips"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "entries_tripId_idx" ON "entries"("tripId");

-- CreateIndex
CREATE INDEX "photos_entryId_idx" ON "photos"("entryId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_tags" ADD CONSTRAINT "trip_tags_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_tags" ADD CONSTRAINT "trip_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
