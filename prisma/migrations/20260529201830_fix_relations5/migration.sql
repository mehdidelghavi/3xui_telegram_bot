-- DropForeignKey
ALTER TABLE `servicesonclients` DROP FOREIGN KEY `ServicesOnClients_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `servicesonclients` DROP FOREIGN KEY `ServicesOnClients_serviceId_fkey`;

-- DropIndex
DROP INDEX `ServicesOnClients_clientId_fkey` ON `servicesonclients`;

-- AlterTable
ALTER TABLE `servers` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `ServicesOnClients` ADD CONSTRAINT `ServicesOnClients_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicesOnClients` ADD CONSTRAINT `ServicesOnClients_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
