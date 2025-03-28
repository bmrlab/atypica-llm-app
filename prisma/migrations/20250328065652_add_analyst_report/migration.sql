-- CreateTable
CREATE TABLE `AnalystReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(64) NOT NULL,
    `analystId` INTEGER NOT NULL,
    `coverSvg` TEXT NOT NULL,
    `onePageHtml` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnalystReport_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalystReport` ADD CONSTRAINT `AnalystReport_analystId_fkey` FOREIGN KEY (`analystId`) REFERENCES `Analyst`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
