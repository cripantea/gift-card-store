-- AlterTable
ALTER TABLE `Order` ADD COLUMN `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `discountCodeId` VARCHAR(191) NULL,
    ADD COLUMN `discountCodeText` VARCHAR(191) NULL,
    ADD COLUMN `faceValue` DECIMAL(10, 2) NULL,
    ADD COLUMN `productSlug` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PendingPaypalCheckout` ADD COLUMN `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `discountCodeId` VARCHAR(191) NULL,
    ADD COLUMN `discountCodeText` VARCHAR(191) NULL,
    ADD COLUMN `faceValue` DECIMAL(10, 2) NULL,
    ADD COLUMN `productSlug` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `DiscountCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('PERCENT', 'FIXED_AMOUNT') NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `scope` ENUM('ALL', 'SELECTED') NOT NULL DEFAULT 'ALL',
    `productSlugs` JSON NULL,
    `minAmount` DECIMAL(10, 2) NULL,
    `maxUses` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DiscountCode_code_key`(`code`),
    INDEX `DiscountCode_active_startsAt_endsAt_idx`(`active`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_discountCodeId_idx` ON `Order`(`discountCodeId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_discountCodeId_fkey` FOREIGN KEY (`discountCodeId`) REFERENCES `DiscountCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
