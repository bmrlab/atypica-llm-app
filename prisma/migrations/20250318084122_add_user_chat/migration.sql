-- AlterTable
ALTER TABLE `Persona` ADD COLUMN `userChatId` INTEGER NULL;

-- CreateTable
CREATE TABLE `UserChat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `messages` JSON NOT NULL,
    `kind` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Persona` ADD CONSTRAINT `Persona_userChatId_fkey` FOREIGN KEY (`userChatId`) REFERENCES `UserChat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChat` ADD CONSTRAINT `UserChat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
