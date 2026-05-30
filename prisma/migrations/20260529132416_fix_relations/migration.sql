/*
  Warnings:

  - You are about to drop the column `inbounds` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `plan` table. All the data in the column will be lost.
  - Added the required column `server_id` to the `service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `plan` DROP FOREIGN KEY `plan_service_id_fkey`;

-- DropIndex
DROP INDEX `plan_service_id_fkey` ON `plan`;

-- AlterTable
ALTER TABLE `plan` DROP COLUMN `inbounds`,
    DROP COLUMN `service_id`;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `inboundIDS` JSON NULL,
    ADD COLUMN `server_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `fullname` VARCHAR(191) NOT NULL,
    MODIFY `username` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ServicesOnPlans` (
    `planId` BIGINT NOT NULL,
    `serviceId` BIGINT NOT NULL,

    PRIMARY KEY (`planId`, `serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service` ADD CONSTRAINT `service_server_id_fkey` FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicesOnPlans` ADD CONSTRAINT `ServicesOnPlans_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicesOnPlans` ADD CONSTRAINT `ServicesOnPlans_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
