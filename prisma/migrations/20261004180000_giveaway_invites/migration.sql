-- AlterTable
ALTER TABLE `GiveawayEntry` ADD COLUMN `inviteId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `GiveawayInvite` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `clickCount` INTEGER NOT NULL DEFAULT 0,
    `firstClickedAt` DATETIME(3) NULL,
    `lastClickedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GiveawayInvite_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `GiveawayEntry_inviteId_idx` ON `GiveawayEntry`(`inviteId`);

-- AddForeignKey
ALTER TABLE `GiveawayEntry` ADD CONSTRAINT `GiveawayEntry_inviteId_fkey` FOREIGN KEY (`inviteId`) REFERENCES `GiveawayInvite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

