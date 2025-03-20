/*
  Warnings:

  - Made the column `studySummary` on table `Analyst` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Analyst` MODIFY `studySummary` TEXT NOT NULL;
