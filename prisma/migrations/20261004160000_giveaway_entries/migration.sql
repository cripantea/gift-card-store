-- CreateTable
CREATE TABLE `GiveawayEntry` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `sourceOther` VARCHAR(191) NULL,
    `knownSince` VARCHAR(191) NOT NULL,
    `marketingConsent` BOOLEAN NOT NULL DEFAULT false,
    `campaign` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `giftCardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GiveawayEntry_phone_key`(`phone`),
    UNIQUE INDEX `GiveawayEntry_giftCardId_key`(`giftCardId`),
    INDEX `GiveawayEntry_ipHash_createdAt_idx`(`ipHash`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GiveawayEntry` ADD CONSTRAINT `GiveawayEntry_giftCardId_fkey` FOREIGN KEY (`giftCardId`) REFERENCES `GiftCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

