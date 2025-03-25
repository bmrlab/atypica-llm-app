/*
  Warnings:

  - A unique constraint covering the columns `[studyUserChatId]` on the table `Analyst` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Analyst` ADD COLUMN `studyUserChatId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Analyst_studyUserChatId_key` ON `Analyst`(`studyUserChatId`);

-- AddForeignKey
ALTER TABLE `Analyst` ADD CONSTRAINT `Analyst_studyUserChatId_fkey` FOREIGN KEY (`studyUserChatId`) REFERENCES `UserChat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
