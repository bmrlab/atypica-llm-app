-- CreateTable
CREATE TABLE `Analyst` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(255) NOT NULL,
    `topic` TEXT NOT NULL,
    `report` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalystInterview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `analystId` INTEGER NOT NULL,
    `personaId` INTEGER NOT NULL,
    `personaPrompt` TEXT NOT NULL,
    `interviewerPrompt` TEXT NOT NULL,
    `messages` JSON NOT NULL,
    `conclusion` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalystInterview` ADD CONSTRAINT `AnalystInterview_analystId_fkey` FOREIGN KEY (`analystId`) REFERENCES `Analyst`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalystInterview` ADD CONSTRAINT `AnalystInterview_personaId_fkey` FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
