/*
  Warnings:

  - You are about to drop the `_daytolecture` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rfid_id` to the `tb_lectures` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_daytolecture` DROP FOREIGN KEY `_DayToLecture_A_fkey`;

-- DropForeignKey
ALTER TABLE `_daytolecture` DROP FOREIGN KEY `_DayToLecture_B_fkey`;

-- AlterTable
ALTER TABLE `tb_lectures` ADD COLUMN `rfid_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_daytolecture`;

-- CreateTable
CREATE TABLE `tb_lecture_day` (
    `lecture_id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`lecture_id`, `day_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_lecture_day` ADD CONSTRAINT `tb_lecture_day_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `tb_lectures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_lecture_day` ADD CONSTRAINT `tb_lecture_day_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `tb_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
