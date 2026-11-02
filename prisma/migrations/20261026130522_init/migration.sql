-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descAr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "pointsAr" TEXT[],
    "pointsEn" TEXT[],
    "tech" TEXT[],
    "imageUrl" TEXT,
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'professional',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "roleAr" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "periodAr" TEXT NOT NULL,
    "periodEn" TEXT NOT NULL,
    "bulletsAr" TEXT[],
    "bulletsEn" TEXT[],
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descAr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "valueAr" TEXT NOT NULL DEFAULT '',
    "valueEn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
