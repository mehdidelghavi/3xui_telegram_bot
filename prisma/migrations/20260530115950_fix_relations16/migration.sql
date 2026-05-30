-- DropIndex
DROP INDEX `servers_settings_key` ON `servers`;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;
