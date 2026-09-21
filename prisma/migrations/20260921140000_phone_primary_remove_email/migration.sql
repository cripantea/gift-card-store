-- Customer: email nullable, phone required + unique
-- Existing rows without phone get a placeholder to satisfy NOT NULL
UPDATE `Customer` SET `phone` = CONCAT('nophone_', `id`) WHERE `phone` IS NULL OR `phone` = '';

ALTER TABLE `Customer`
  MODIFY `email` VARCHAR(191) NULL,
  MODIFY `phone` VARCHAR(191) NOT NULL;

ALTER TABLE `Customer`
  ADD UNIQUE INDEX `Customer_phone_key` (`phone`);

-- PendingPaypalCheckout: buyerPhone NOT NULL (was nullable), remove buyerEmail
UPDATE `PendingPaypalCheckout` SET `buyerPhone` = '' WHERE `buyerPhone` IS NULL;

ALTER TABLE `PendingPaypalCheckout`
  MODIFY `buyerPhone` VARCHAR(191) NOT NULL;

ALTER TABLE `PendingPaypalCheckout`
  DROP COLUMN `buyerEmail`;
