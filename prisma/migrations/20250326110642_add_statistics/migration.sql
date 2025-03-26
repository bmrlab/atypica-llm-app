-- CreateTable
CREATE TABLE `ChatStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userChatId` INTEGER NOT NULL,
    `dimension` VARCHAR(255) NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 0,
    `extra` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatStatistics` ADD CONSTRAINT `ChatStatistics_userChatId_fkey` FOREIGN KEY (`userChatId`) REFERENCES `UserChat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
