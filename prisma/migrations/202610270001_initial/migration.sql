-- Initial PostgreSQL schema. IDs and updatedAt are supplied by Prisma.

CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TYPE "ProjectType" AS ENUM ('SECURITY_LAB', 'PROGRAMMING', 'NETWORKING', 'RESEARCH', 'OTHER');

CREATE TABLE "AdminProfile" (
  "id" UUID NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Administrator',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Technology" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "markdown" TEXT NOT NULL DEFAULT '',
  "categoryId" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
  "projectType" "ProjectType" NOT NULL DEFAULT 'OTHER',
  "projectDate" TIMESTAMP(3) NOT NULL,
  "githubUrl" TEXT,
  "liveUrl" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "pinnedOrder" INTEGER NOT NULL DEFAULT 0,
  "coverId" TEXT,
  "architectureId" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectTag" (
  "projectId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "ProjectTag_pkey" PRIMARY KEY ("projectId", "tagId")
);

CREATE TABLE "ProjectImage" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "caption" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectDownload" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  CONSTRAINT "ProjectDownload_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectVideo" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "ProjectVideo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectTechnology" (
  "projectId" TEXT NOT NULL,
  "technologyId" TEXT NOT NULL,
  CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY ("projectId", "technologyId")
);

CREATE TABLE "SkillCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "icon" TEXT NOT NULL DEFAULT 'code',
  "proficiency" TEXT NOT NULL DEFAULT 'Learning',
  "evidenceUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "providerAssetId" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "deliveryUrl" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "alt" TEXT NOT NULL,
  "caption" TEXT NOT NULL DEFAULT '',
  "ownerId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "group" TEXT NOT NULL DEFAULT 'General',
  "caption" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Certificate" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "categoryId" TEXT,
  "description" TEXT NOT NULL DEFAULT '',
  "credentialUrl" TEXT,
  "credentialId" TEXT,
  "pdfId" TEXT,
  "thumbnailId" TEXT,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Resource" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "resourceType" TEXT NOT NULL DEFAULT 'REPORT',
  "categoryId" TEXT,
  "markdown" TEXT NOT NULL DEFAULT '',
  "externalUrl" TEXT,
  "assetId" TEXT,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TimelineEvent" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "description" TEXT NOT NULL,
  "projectId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
  "id" TEXT NOT NULL DEFAULT 'site',
  "name" TEXT NOT NULL DEFAULT 'Your name',
  "title" TEXT NOT NULL DEFAULT 'SIWES Cybersecurity Portfolio',
  "introduction" TEXT NOT NULL DEFAULT 'Add your introduction in Settings.',
  "role" TEXT NOT NULL DEFAULT 'Training focus — add your details',
  "organization" TEXT NOT NULL DEFAULT '',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "githubUrl" TEXT,
  "linkedinUrl" TEXT,
  "email" TEXT,
  "portfolioUrl" TEXT,
  "seoDescription" TEXT NOT NULL DEFAULT 'Projects, practical labs, and learning from industrial training.',
  "technologies" TEXT NOT NULL DEFAULT '',
  "ethicalContext" TEXT NOT NULL DEFAULT 'Security work shown here is limited to authorized labs and ethical research.',
  "reportId" TEXT,
  "showGallery" BOOLEAN NOT NULL DEFAULT true,
  "showTimeline" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsDaily" (
  "day" DATE NOT NULL,
  "kind" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AnalyticsDaily_pkey" PRIMARY KEY ("day", "kind", "target")
);

CREATE TABLE "RateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "SlugRedirect" (
  "slug" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  CONSTRAINT "SlugRedirect_pkey" PRIMARY KEY ("slug")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category" ("name");

CREATE UNIQUE INDEX "Tag_name_key" ON "Tag" ("name");

CREATE UNIQUE INDEX "Technology_name_key" ON "Technology" ("name");

CREATE UNIQUE INDEX "Project_slug_key" ON "Project" ("slug");

ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_architectureId_fkey" FOREIGN KEY ("architectureId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Project_status_projectDate_idx" ON "Project" ("status", "projectDate");

CREATE INDEX "Project_status_categoryId_difficulty_idx" ON "Project" ("status", "categoryId", "difficulty");

CREATE INDEX "Project_featured_pinnedOrder_idx" ON "Project" ("featured", "pinnedOrder");

ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ProjectImage_projectId_assetId_key" ON "ProjectImage" ("projectId", "assetId");

ALTER TABLE "ProjectDownload" ADD CONSTRAINT "ProjectDownload_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectDownload" ADD CONSTRAINT "ProjectDownload_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ProjectDownload_projectId_assetId_key" ON "ProjectDownload" ("projectId", "assetId");

ALTER TABLE "ProjectVideo" ADD CONSTRAINT "ProjectVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ProjectTechnology_technologyId_idx" ON "ProjectTechnology" ("technologyId");

CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory" ("name");

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "MediaAsset_providerAssetId_key" ON "MediaAsset" ("providerAssetId");

CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset" ("publicId");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AdminProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset" ("createdAt");

ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit" ("expiresAt");

ALTER TABLE "SlugRedirect" ADD CONSTRAINT "SlugRedirect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminProfile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Technology" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ProjectTag" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ProjectImage" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ProjectDownload" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ProjectVideo" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ProjectTechnology" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "SkillCategory" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "MediaAsset" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "GalleryItem" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Certificate" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Resource" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "AnalyticsDaily" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "SlugRedirect" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
  END IF;
END $$;
