-- Data Element Platform - Rule Engine Schema
-- All tables prefixed with dep_

CREATE TABLE IF NOT EXISTS `dep_data_source_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL COMMENT 'Data source name',
    `description` VARCHAR(500) DEFAULT NULL,
    `db_type` VARCHAR(20) NOT NULL DEFAULT 'MYSQL' COMMENT 'MYSQL, ORACLE, HIVE',
    `db_url` VARCHAR(500) NOT NULL COMMENT 'JDBC URL',
    `db_username` VARCHAR(100) NOT NULL,
    `db_password` VARCHAR(200) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_rule_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) DEFAULT NULL,
    `data_source_id` BIGINT NOT NULL,
    `table_name` VARCHAR(200) DEFAULT NULL COMMENT 'Target table to validate',
    `table_label` VARCHAR(200) DEFAULT NULL,
    `query_sql` TEXT DEFAULT NULL COMMENT 'Custom query SQL (optional, overrides table_name)',
    `specified_fields` TEXT DEFAULT NULL COMMENT 'Query columns, comma-separated. Default * if empty',
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_data_source_id` (`data_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_rule_definition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT NOT NULL,
    `rule_level` VARCHAR(20) NOT NULL DEFAULT 'FIELD',
    `field_name` VARCHAR(200) NOT NULL,
    `rule_type` VARCHAR(50) NOT NULL,
    `rule_params` JSON DEFAULT NULL,
    `custom_sql` TEXT DEFAULT NULL,
    `script_body` TEXT DEFAULT NULL COMMENT 'Dynamic script body (JS/Java)',
    `script_language` VARCHAR(20) DEFAULT NULL COMMENT 'js or java',
    `description` VARCHAR(500) DEFAULT NULL,
    `importance_level` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `rule_weight` INT NOT NULL DEFAULT 1,
    `sort_order` INT NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_quality_report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `rule_group_id` BIGINT NOT NULL,
    `task_id` BIGINT DEFAULT NULL COMMENT 'FK to dep_execution_task',
    `table_name` VARCHAR(200),
    `table_label` VARCHAR(200),
    `total_score` DECIMAL(8,2) NOT NULL DEFAULT 0,
    `score_level` VARCHAR(20),
    `total_rows` BIGINT DEFAULT 0,
    `total_rules` INT DEFAULT 0,
    `passed_rules` INT DEFAULT 0,
    `failed_rules` INT DEFAULT 0,
    `execution_id` BIGINT,
    `report_data` JSON,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_rule_group` (`rule_group_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_work_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_no` VARCHAR(50) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `urgency` VARCHAR(20) DEFAULT 'NORMAL',
    `issue_type` VARCHAR(50) DEFAULT 'ACCURACY',
    `report_id` BIGINT,
    `rule_group_id` BIGINT,
    `table_name` VARCHAR(200),
    `data_source_unit` VARCHAR(200),
    `issue_description` TEXT,
    `issue_impact` TEXT,
    `suggestion` TEXT,
    `process_instance_id` VARCHAR(100),
    `assignee` VARCHAR(100),
    `created_by` VARCHAR(100),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_work_order_issue` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `field_name` VARCHAR(200),
    `field_code` VARCHAR(200),
    `issue_type` VARCHAR(50),
    `rule_description` VARCHAR(500),
    `issue_count` BIGINT DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_work_order_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `operator` VARCHAR(100),
    `operator_dept` VARCHAR(200),
    `comment` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_dict_table` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_code` VARCHAR(100) NOT NULL,
    `dict_name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_dict_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_code` VARCHAR(100) NOT NULL,
    `item_value` VARCHAR(200) NOT NULL,
    `item_label` VARCHAR(200) DEFAULT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT NOT NULL,
    `rule_group_name` VARCHAR(200) DEFAULT NULL,
    `total_rows` BIGINT NOT NULL DEFAULT 0,
    `total_rules` INT NOT NULL DEFAULT 0,
    `passed_rules` INT NOT NULL DEFAULT 0,
    `failed_rules` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME DEFAULT NULL,
    `duration_ms` BIGINT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `execution_id` BIGINT NOT NULL,
    `rule_id` BIGINT NOT NULL,
    `field_name` VARCHAR(200) NOT NULL,
    `rule_type` VARCHAR(50) NOT NULL,
    `rule_description` VARCHAR(500) DEFAULT NULL,
    `total_rows` BIGINT NOT NULL DEFAULT 0,
    `violated_rows` BIGINT NOT NULL DEFAULT 0,
    `compliance_rate` DECIMAL(8,4) NOT NULL DEFAULT 0,
    `quality_result` VARCHAR(20) NOT NULL DEFAULT 'PASS',
    `sample_violations` JSON DEFAULT NULL,
    `duration_ms` BIGINT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_execution_id` (`execution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT,
    `rule_group_name` VARCHAR(200),
    `status` VARCHAR(30),
    `priority` INT DEFAULT 0,
    `total_rules` INT DEFAULT 0,
    `completed_rules` INT DEFAULT 0,
    `current_step` VARCHAR(200),
    `progress` INT DEFAULT 0,
    `execution_id` BIGINT,
    `thread_name` VARCHAR(100),
    `cpu_usage_pct` DECIMAL(5,2),
    `memory_usage_mb` BIGINT,
    `error_message` TEXT,
    `queued_at` DATETIME,
    `started_at` DATETIME,
    `finished_at` DATETIME,
    `duration_ms` BIGINT,
    `created_by` VARCHAR(100),
    `data_source_id` BIGINT,
    `total_rows` BIGINT DEFAULT 0,
    `sub_task_count` INT DEFAULT 0,
    `completed_sub_tasks` INT DEFAULT 0,
    `batch_size` INT DEFAULT 10000,
    `max_concurrent_sub_tasks` INT DEFAULT 10,
    `max_sub_task_timeout_sec` INT DEFAULT 60,
    `specified_fields` TEXT,
    `time_filter_field` VARCHAR(200),
    `time_range_start` VARCHAR(50),
    `time_range_end` VARCHAR(50),
    `primary_key_field` VARCHAR(200),
    `row_limit` BIGINT,
    `powerjob_instance_id` VARCHAR(100),
    `table_name` VARCHAR(200),
    `report_id` BIGINT,
    `cron_expression` VARCHAR(100) DEFAULT NULL COMMENT 'Cron expression for scheduled execution',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_rule_group` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_sub_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL,
    `sub_task_index` INT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    `offset_start` BIGINT DEFAULT 0,
    `offset_end` BIGINT DEFAULT 0,
    `row_count` BIGINT DEFAULT 0,
    `processed_rules` INT DEFAULT 0,
    `total_rules` INT DEFAULT 0,
    `violated_count` BIGINT DEFAULT 0,
    `passed_count` BIGINT DEFAULT 0,
    `thread_name` VARCHAR(100),
    `cpu_usage_pct` DECIMAL(5,2),
    `memory_usage_mb` BIGINT,
    `error_message` TEXT,
    `started_at` DATETIME,
    `finished_at` DATETIME,
    `duration_ms` BIGINT,
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_step_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `task_id` BIGINT,
    `step_index` INT,
    `step_name` VARCHAR(200),
    `rule_id` BIGINT,
    `field_name` VARCHAR(200),
    `rule_type` VARCHAR(50),
    `status` VARCHAR(30),
    `total_rows` BIGINT DEFAULT 0,
    `violated_rows` BIGINT DEFAULT 0,
    `duration_ms` BIGINT,
    `memory_delta_mb` BIGINT,
    `error_message` TEXT,
    `started_at` DATETIME,
    `finished_at` DATETIME,
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_execution_violation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `execution_id` BIGINT,
    `detail_id` BIGINT,
    `rule_type` VARCHAR(50),
    `field_name` VARCHAR(200),
    `row_index` BIGINT,
    `row_data` TEXT,
    `field_value` TEXT,
    `violation_reason` VARCHAR(500),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_execution_id` (`execution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_rule_type_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type_code` VARCHAR(50) NOT NULL,
    `type_name` VARCHAR(200),
    `rule_level` VARCHAR(20) DEFAULT 'FIELD',
    `description` VARCHAR(500),
    `default_params` JSON,
    `needs_params` INT DEFAULT 0,
    `param_template` TEXT,
    `dict_code` VARCHAR(100),
    `status` INT DEFAULT 1,
    `sort_order` INT DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dep_rule_chain` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT,
    `chain_name` VARCHAR(200),
    `field_name` VARCHAR(200),
    `chain_el` TEXT,
    `logic_type` VARCHAR(20),
    `description` VARCHAR(500),
    `status` INT DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
