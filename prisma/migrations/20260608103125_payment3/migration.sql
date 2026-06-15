/*
  Warnings:

  - You are about to drop the column `banName` on the `paymentmethoddetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentmethoddetail` DROP COLUMN `banName`,
    ADD COLUMN `bankName` VARCHAR(191) NULL;
