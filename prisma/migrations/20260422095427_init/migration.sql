-- CreateTable
CREATE TABLE `kb_domains` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kb_source` VARCHAR(10) NOT NULL,
    `domain_key` VARCHAR(100) NOT NULL,
    `domain_name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `concept_count` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `kb_domains_kb_source_domain_key_key`(`kb_source`, `domain_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kb_concepts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `domain_id` INTEGER NOT NULL,
    `concept_key` VARCHAR(200) NOT NULL,
    `concept_name` VARCHAR(300) NOT NULL,
    `definition` TEXT NULL,
    `explanation` TEXT NULL,
    `sources` JSON NULL,
    `code_scaffold` TEXT NULL,
    `relationships` JSON NULL,
    `metadata` JSON NULL,

    INDEX `idx_concept_key`(`concept_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playbook_phases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phase_num` TINYINT NOT NULL,
    `slug` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(10) NULL,
    `color` VARCHAR(7) NULL,
    `duration` VARCHAR(30) NULL,
    `subtitle` VARCHAR(300) NULL,
    `interview_angle` TEXT NULL,
    `sort_order` TINYINT NOT NULL,

    UNIQUE INDEX `playbook_phases_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playbook_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phase_id` INTEGER NOT NULL,
    `step_num` TINYINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `code_example` TEXT NULL,
    `pro_tip` TEXT NULL,
    `deliverables` JSON NULL,
    `tools` JSON NULL,
    `table_data` JSON NULL,
    `sort_order` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gate_checks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phase_id` INTEGER NOT NULL,
    `gate_title` VARCHAR(200) NOT NULL,
    `check_items` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `current_phase_id` INTEGER NULL,
    `architecture_pattern` VARCHAR(50) NULL,
    `framework` VARCHAR(50) NULL,
    `model_strategy` JSON NULL,
    `team_members` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_phase_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `phase_id` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'not_started',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `notes` TEXT NULL,

    UNIQUE INDEX `project_phase_progress_project_id_phase_id_key`(`project_id`, `phase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_gate_checks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `gate_check_id` INTEGER NOT NULL,
    `item_index` TINYINT NOT NULL,
    `checked` BOOLEAN NOT NULL DEFAULT false,
    `checked_at` DATETIME(3) NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `phase_id` INTEGER NULL,
    `fields` JSON NOT NULL,

    UNIQUE INDEX `templates_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_fills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER NOT NULL,
    `project_id` INTEGER NULL,
    `title` VARCHAR(200) NOT NULL,
    `field_values` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `governance_assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `assessment_type` VARCHAR(20) NOT NULL DEFAULT 'initial',
    `trust_layer_scores` JSON NULL,
    `risk_classification` VARCHAR(20) NULL,
    `compliance_status` JSON NULL,
    `overall_score` DECIMAL(4, 1) NULL,
    `assessor` VARCHAR(100) NULL,
    `assessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `severity` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `mitigation` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'open',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wharton_domain_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `domain_key` VARCHAR(30) NOT NULL,
    `domain_name` VARCHAR(100) NOT NULL,
    `score` DECIMAL(3, 2) NOT NULL,
    `risk_level` VARCHAR(20) NULL,
    `current_state` JSON NULL,
    `gaps` JSON NULL,
    `actions` JSON NULL,
    `question_scores` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caio_assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `initiative_name` VARCHAR(200) NOT NULL,
    `assessment_mode` VARCHAR(20) NOT NULL DEFAULT 'audit',
    `overall_score` DECIMAL(3, 2) NULL,
    `maturity_level` TINYINT NULL,
    `maturity_label` VARCHAR(20) NULL,
    `target_maturity` TINYINT NULL,
    `risk_classification` VARCHAR(20) NULL,
    `executive_summary` TEXT NULL,
    `assessor` VARCHAR(100) NULL,
    `assessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caio_domain_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `domain_key` VARCHAR(30) NOT NULL,
    `domain_name` VARCHAR(100) NOT NULL,
    `score` DECIMAL(3, 2) NOT NULL,
    `risk_level` VARCHAR(20) NULL,
    `current_state` JSON NULL,
    `gaps` JSON NULL,
    `actions` JSON NULL,
    `question_scores` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caio_findings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `domain_key` VARCHAR(30) NOT NULL,
    `severity` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `finding` TEXT NOT NULL,
    `rationale` TEXT NULL,
    `framework_ref` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caio_action_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `phase` VARCHAR(20) NOT NULL,
    `domain_key` VARCHAR(30) NOT NULL,
    `action` TEXT NOT NULL,
    `framework_ref` VARCHAR(200) NULL,
    `owner` VARCHAR(50) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `eval_type` VARCHAR(30) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `options` JSON NOT NULL,
    `criteria` JSON NOT NULL,
    `scores` JSON NOT NULL,
    `recommendation` VARCHAR(200) NULL,
    `rationale` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kb_queries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NULL,
    `query_text` TEXT NOT NULL,
    `response` TEXT NULL,
    `concepts_used` JSON NULL,
    `model_used` VARCHAR(50) NULL,
    `tokens_used` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `role` VARCHAR(10) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT NULL,

    UNIQUE INDEX `settings_user_id_setting_key_key`(`user_id`, `setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kb_concepts` ADD CONSTRAINT `kb_concepts_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `kb_domains`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playbook_steps` ADD CONSTRAINT `playbook_steps_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `playbook_phases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gate_checks` ADD CONSTRAINT `gate_checks_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `playbook_phases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_current_phase_id_fkey` FOREIGN KEY (`current_phase_id`) REFERENCES `playbook_phases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_phase_progress` ADD CONSTRAINT `project_phase_progress_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_phase_progress` ADD CONSTRAINT `project_phase_progress_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `playbook_phases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_gate_checks` ADD CONSTRAINT `project_gate_checks_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_gate_checks` ADD CONSTRAINT `project_gate_checks_gate_check_id_fkey` FOREIGN KEY (`gate_check_id`) REFERENCES `gate_checks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_phase_id_fkey` FOREIGN KEY (`phase_id`) REFERENCES `playbook_phases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_fills` ADD CONSTRAINT `template_fills_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_fills` ADD CONSTRAINT `template_fills_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `governance_assessments` ADD CONSTRAINT `governance_assessments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_items` ADD CONSTRAINT `risk_items_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `governance_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wharton_domain_scores` ADD CONSTRAINT `wharton_domain_scores_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `governance_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caio_assessments` ADD CONSTRAINT `caio_assessments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caio_domain_scores` ADD CONSTRAINT `caio_domain_scores_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `caio_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caio_findings` ADD CONSTRAINT `caio_findings_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `caio_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caio_action_items` ADD CONSTRAINT `caio_action_items_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `caio_assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_queries` ADD CONSTRAINT `kb_queries_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
