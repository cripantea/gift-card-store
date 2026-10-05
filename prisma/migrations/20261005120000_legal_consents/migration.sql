-- Accettazione delle condizioni di vendita e prova dei consensi (audit legale 2026-10-05)

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `termsVersion` VARCHAR(191) NULL,
    ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PendingPaypalCheckout` ADD COLUMN `termsVersion` VARCHAR(191) NULL,
    ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `GiveawayEntry` ADD COLUMN `marketingConsentAt` DATETIME(3) NULL,
    ADD COLUMN `marketingConsentText` TEXT NULL,
    ADD COLUMN `termsVersion` VARCHAR(191) NULL,
    ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL,
    ADD COLUMN `anonymizedAt` DATETIME(3) NULL;
