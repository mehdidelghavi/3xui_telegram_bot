/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(2))`.
  - You are about to drop the column `order_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `paymentmethoddetail` table. All the data in the column will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `account_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_order_id_fkey`;

-- DropIndex
DROP INDEX `payment_order_id_fkey` ON `payment`;

-- AlterTable
ALTER TABLE `client` ADD COLUMN `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `client_id` BIGINT NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `note` VARCHAR(191) NULL,
    MODIFY `status` ENUM('PURCHASE', 'RENEW') NOT NULL DEFAULT 'PURCHASE';

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `order_id`,
    MODIFY `status` ENUM('PENDING', 'WAITING_CONFIRMATION', 'SUCCESS', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `paymentmethoddetail` DROP COLUMN `text`,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `cardHolder` VARCHAR(191) NULL,
    ADD COLUMN `cardNumber` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `network` VARCHAR(191) NULL,
    ADD COLUMN `walletAddress` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `account`;

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

-- CreateIndex
CREATE UNIQUE INDEX `client_email_key` ON `client`(`email`);

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
