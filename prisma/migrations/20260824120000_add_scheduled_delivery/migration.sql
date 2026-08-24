-- AlterTable: GiftCard — add scheduledAt and emailSentAt for deferred delivery
ALTER TABLE `GiftCard`
  ADD COLUMN `scheduledAt` DATETIME(3) NULL,
  ADD COLUMN `emailSentAt` DATETIME(3) NULL;

-- Index to efficiently query gift cards pending scheduled delivery
CREATE INDEX `GiftCard_scheduledAt_emailSentAt_idx` ON `GiftCard`(`scheduledAt`, `emailSentAt`);

-- AlterTable: PendingPaypalCheckout — propagate scheduledAt through the PayPal flow
ALTER TABLE `PendingPaypalCheckout`
  ADD COLUMN `scheduledAt` DATETIME(3) NULL;
