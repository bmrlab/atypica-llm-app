/*
  Warnings:

  - A unique constraint covering the columns `[analystId,personaId]` on the table `AnalystInterview` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AnalystInterview_analystId_personaId_key` ON `AnalystInterview`(`analystId`, `personaId`);
