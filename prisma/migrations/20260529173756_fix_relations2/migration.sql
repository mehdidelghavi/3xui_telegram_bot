/*
  Warnings:

  - Added the required column `days` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `server_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `traffic` to the `client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `client_plan_id_fkey`;

-- DropIndex
DROP INDEX `client_plan_id_fkey` ON `client`;

-- AlterTable
ALTER TABLE `client` ADD COLUMN `days` INTEGER NOT NULL,
    ADD COLUMN `price` INTEGER NOT NULL,
    ADD COLUMN `server_id` INTEGER NOT NULL,
    ADD COLUMN `service_id` BIGINT NOT NULL,
    ADD COLUMN `traffic` INTEGER NOT NULL,
    MODIFY `plan_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_server_id_fkey` FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
