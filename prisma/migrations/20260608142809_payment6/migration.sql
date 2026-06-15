/*
  Warnings:

  - You are about to drop the column `order_id` on the `payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_order_id_fkey`;

-- DropIndex
DROP INDEX `payment_order_id_fkey` ON `payment`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `order_id`,
    MODIFY `status` ENUM('PENDING', 'WAITING_CONFIRMATION', 'SUCCESS', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `wallet_transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `amount` BIGINT NOT NULL,
    `type` ENUM('DEPOSIT', 'PURCHASE', 'REFUND') NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
