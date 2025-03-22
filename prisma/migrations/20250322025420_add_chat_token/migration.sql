/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `UserChat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `UserChat` ADD COLUMN `token` VARCHAR(64) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserChat_token_key` ON `UserChat`(`token`);
