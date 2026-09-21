-- Add optional buyer phone to PendingPaypalCheckout for FusionCRM webhook

ALTER TABLE `PendingPaypalCheckout`
  ADD COLUMN `buyerPhone` VARCHAR(191) NULL;
