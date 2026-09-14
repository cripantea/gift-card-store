-- Rename recipientEmail to recipientPhone — delivery is now via WhatsApp
ALTER TABLE `GiftCard` CHANGE `recipientEmail` `recipientPhone` VARCHAR(191) NOT NULL;
ALTER TABLE `PendingPaypalCheckout` CHANGE `recipientEmail` `recipientPhone` VARCHAR(191) NOT NULL;
