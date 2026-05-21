/*
  Warnings:

  - You are about to drop the column `category_id` on the `cms_pages` table. All the data in the column will be lost.
  - You are about to drop the `page_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cms_pages` DROP FOREIGN KEY `cms_pages_category_id_fkey`;

-- AlterTable
ALTER TABLE `cms_pages` DROP COLUMN `category_id`,
    ADD COLUMN `category` ENUM('HOME', 'ABOUT_US', 'ACADEMICS', 'RESEARCH', 'ADMISSION', 'NORMAL') NOT NULL DEFAULT 'NORMAL';

-- DropTable
DROP TABLE `page_categories`;

-- CreateIndex
CREATE INDEX `cms_pages_category_idx` ON `cms_pages`(`category`);
