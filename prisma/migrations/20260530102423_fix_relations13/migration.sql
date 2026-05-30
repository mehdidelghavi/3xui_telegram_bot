-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` MODIFY `fullname` VARCHAR(191) NULL;
