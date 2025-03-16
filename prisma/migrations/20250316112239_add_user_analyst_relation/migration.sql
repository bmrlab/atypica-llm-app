-- CreateTable
CREATE TABLE `UserAnalyst` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `analystId` INTEGER NOT NULL,
    `role` VARCHAR(255) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserAnalyst_userId_idx`(`userId`),
    INDEX `UserAnalyst_analystId_idx`(`analystId`),
    UNIQUE INDEX `UserAnalyst_userId_analystId_key`(`userId`, `analystId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAnalyst` ADD CONSTRAINT `UserAnalyst_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAnalyst` ADD CONSTRAINT `UserAnalyst_analystId_fkey` FOREIGN KEY (`analystId`) REFERENCES `Analyst`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
