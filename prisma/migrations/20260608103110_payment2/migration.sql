/*
  Warnings:

  - You are about to drop the column `text` on the `paymentmethoddetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentmethoddetail` DROP COLUMN `text`,
    ADD COLUMN `banName` VARCHAR(191) NULL,
    ADD COLUMN `cardHolder` VARCHAR(191) NULL,
    ADD COLUMN `cardNumber` VARCHAR(191) NULL,
    ADD COLUMN `netowk` VARCHAR(191) NULL,
    ADD COLUMN `walletAddress` VARCHAR(191) NULL;
