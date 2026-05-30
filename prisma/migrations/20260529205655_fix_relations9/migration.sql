/*
  Warnings:

  - Added the required column `text` to the `notebook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notebook` ADD COLUMN `text` JSON NOT NULL;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;
