/*
  Warnings:

  - You are about to drop the column `netowk` on the `paymentmethoddetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentmethoddetail` DROP COLUMN `netowk`,
    ADD COLUMN `network` VARCHAR(191) NULL;
