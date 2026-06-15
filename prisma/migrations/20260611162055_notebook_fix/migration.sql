-- DropForeignKey
ALTER TABLE `notebook` DROP FOREIGN KEY `notebook_client_id_fkey`;

-- AlterTable
ALTER TABLE `notebook` MODIFY `client_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `notebook` ADD CONSTRAINT `notebook_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
