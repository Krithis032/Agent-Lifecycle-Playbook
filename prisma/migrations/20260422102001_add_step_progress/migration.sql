-- CreateTable
CREATE TABLE `project_step_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `step_id` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'not_started',
    `notes` TEXT NULL,
    `deliverable_data` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `project_step_progress_project_id_step_id_key`(`project_id`, `step_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_step_progress` ADD CONSTRAINT `project_step_progress_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_step_progress` ADD CONSTRAINT `project_step_progress_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `playbook_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
