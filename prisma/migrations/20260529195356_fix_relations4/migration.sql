/*
  Warnings:

  - You are about to drop the column `service_id` on the `client` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `client_service_id_fkey`;

-- DropIndex
DROP INDEX `client_service_id_fkey` ON `client`;

-- AlterTable
ALTER TABLE `client` DROP COLUMN `service_id`;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `ServicesOnClients` (
    `serviceId` BIGINT NOT NULL,
    `clientId` BIGINT NOT NULL,

    PRIMARY KEY (`serviceId`, `clientId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServicesOnClients` ADD CONSTRAINT `ServicesOnClients_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicesOnClients` ADD CONSTRAINT `ServicesOnClients_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
