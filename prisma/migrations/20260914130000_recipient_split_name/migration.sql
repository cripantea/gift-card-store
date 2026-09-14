-- Split recipientName into recipientFirstName + recipientLastName

ALTER TABLE `GiftCard`
  ADD COLUMN `recipientFirstName` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `recipientLastName`  VARCHAR(191) NOT NULL DEFAULT '';

UPDATE `GiftCard` SET
  `recipientFirstName` = SUBSTRING_INDEX(`recipientName`, ' ', 1),
  `recipientLastName`  = IF(
    INSTR(`recipientName`, ' ') > 0,
    TRIM(SUBSTR(`recipientName`, INSTR(`recipientName`, ' ') + 1)),
    ''
  );

ALTER TABLE `GiftCard` DROP COLUMN `recipientName`;

ALTER TABLE `PendingPaypalCheckout`
  ADD COLUMN `recipientFirstName` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `recipientLastName`  VARCHAR(191) NOT NULL DEFAULT '';

UPDATE `PendingPaypalCheckout` SET
  `recipientFirstName` = SUBSTRING_INDEX(`recipientName`, ' ', 1),
  `recipientLastName`  = IF(
    INSTR(`recipientName`, ' ') > 0,
    TRIM(SUBSTR(`recipientName`, INSTR(`recipientName`, ' ') + 1)),
    ''
  );

ALTER TABLE `PendingPaypalCheckout` DROP COLUMN `recipientName`;
