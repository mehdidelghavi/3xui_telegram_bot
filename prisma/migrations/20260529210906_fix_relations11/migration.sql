/*
  Warnings:

  - You are about to alter the column `message_id` on the `notebook` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `notebook` MODIFY `message_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;
