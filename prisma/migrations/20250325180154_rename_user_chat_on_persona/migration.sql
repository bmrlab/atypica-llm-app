-- DropForeignKey
ALTER TABLE `Persona` DROP FOREIGN KEY `Persona_userChatId_fkey`;

-- DropIndex
DROP INDEX `Persona_userChatId_fkey` ON `Persona`;

-- Rename column to preserve data
ALTER TABLE `Persona` CHANGE COLUMN `userChatId` `scoutUserChatId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Persona` ADD CONSTRAINT `Persona_scoutUserChatId_fkey` FOREIGN KEY (`scoutUserChatId`) REFERENCES `UserChat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
