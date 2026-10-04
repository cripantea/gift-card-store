-- DropForeignKey
ALTER TABLE `GiveawayEntry` DROP FOREIGN KEY `GiveawayEntry_inviteId_fkey`;

-- DropIndex
DROP INDEX `GiveawayEntry_inviteId_idx` ON `GiveawayEntry`;

-- AlterTable
ALTER TABLE `GiveawayEntry` DROP COLUMN `inviteId`,
    ADD COLUMN `email` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `GiveawayInvite`;

-- CreateTable
CREATE TABLE `GiveawayVisit` (
    `id` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GiveawayVisit_createdAt_idx`(`createdAt`),
    INDEX `GiveawayVisit_visitorId_idx`(`visitorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `GiveawayEntry_email_key` ON `GiveawayEntry`(`email`);

