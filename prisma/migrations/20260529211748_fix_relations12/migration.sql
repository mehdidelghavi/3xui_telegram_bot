-- AlterTable
ALTER TABLE `notebook` MODIFY `message_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;
