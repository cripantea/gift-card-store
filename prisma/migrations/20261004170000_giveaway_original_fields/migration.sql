-- AlterTable
ALTER TABLE `GiveawayEntry` ADD COLUMN `birthDate` DATE NULL,
    ADD COLUMN `favoriteServices` JSON NULL,
    ADD COLUMN `note` TEXT NULL;

