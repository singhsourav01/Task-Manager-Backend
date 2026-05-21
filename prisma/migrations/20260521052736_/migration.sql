/*
  Warnings:

  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_task_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_members` DROP FOREIGN KEY `project_members_project_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_members` DROP FOREIGN KEY `project_members_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_tasks` DROP FOREIGN KEY `project_tasks_assigned_to_fkey`;

-- DropForeignKey
ALTER TABLE `project_tasks` DROP FOREIGN KEY `project_tasks_project_id_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_created_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `task_users` DROP FOREIGN KEY `task_users_task_id_fkey`;

-- DropForeignKey
ALTER TABLE `task_users` DROP FOREIGN KEY `task_users_user_id_fkey`;

-- DropTable
DROP TABLE `comments`;

-- DropTable
DROP TABLE `project_members`;

-- DropTable
DROP TABLE `project_tasks`;

-- DropTable
DROP TABLE `projects`;

-- DropTable
DROP TABLE `task_users`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `schools` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `schools_name_key`(`name`),
    UNIQUE INDEX `schools_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_pages` (
    `id` VARCHAR(191) NOT NULL,
    `page_name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `section` ENUM('MAIN', 'SCHOOL') NOT NULL DEFAULT 'MAIN',
    `parent_id` VARCHAR(191) NULL,
    `sub_parent_id` VARCHAR(191) NULL,
    `page_order` INTEGER NOT NULL DEFAULT 0,
    `page_type` ENUM('TOP', 'NONE') NOT NULL DEFAULT 'NONE',
    `content_type` ENUM('CONTENT_PAGE', 'URL') NOT NULL DEFAULT 'CONTENT_PAGE',
    `external_url` TEXT NULL,
    `page_title` VARCHAR(191) NOT NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `target` ENUM('SELF', 'NEW') NOT NULL DEFAULT 'SELF',
    `school_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cms_pages_slug_key`(`slug`),
    INDEX `cms_pages_slug_idx`(`slug`),
    INDEX `cms_pages_parent_id_idx`(`parent_id`),
    INDEX `cms_pages_section_idx`(`section`),
    INDEX `cms_pages_school_id_idx`(`school_id`),
    INDEX `cms_pages_is_published_idx`(`is_published`),
    INDEX `cms_pages_page_order_idx`(`page_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cms_pages` ADD CONSTRAINT `cms_pages_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `cms_pages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cms_pages` ADD CONSTRAINT `cms_pages_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
