-- AlterTable
ALTER TABLE `cms_pages` ADD COLUMN `category_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `page_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `page_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_categories_name_key`(`name`),
    UNIQUE INDEX `page_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cms_pages_category_id_idx` ON `cms_pages`(`category_id`);

-- AddForeignKey
ALTER TABLE `cms_pages` ADD CONSTRAINT `cms_pages_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `page_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
