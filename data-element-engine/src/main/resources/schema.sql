-- Rule Engine Database Schema

-- Data source configuration: which table/data to validate
CREATE TABLE IF NOT EXISTS `data_source_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL COMMENT 'Data source name',
    `description` VARCHAR(500) DEFAULT NULL COMMENT 'Description',
    `db_type` VARCHAR(20) NOT NULL DEFAULT 'MYSQL' COMMENT 'Database type: MYSQL, ORACLE, HIVE',
    `db_url` VARCHAR(500) NOT NULL COMMENT 'JDBC URL',
    `db_username` VARCHAR(100) NOT NULL,
    `db_password` VARCHAR(200) NOT NULL,
    `table_name` VARCHAR(200) NOT NULL COMMENT 'Target table name',
    `query_sql` VARCHAR(2000) DEFAULT NULL COMMENT 'Custom query SQL (optional, overrides table_name)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=enabled 0=disabled',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data source configuration';

-- Rule group: a logical grouping of validation rules for one data source
CREATE TABLE IF NOT EXISTS `rule_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL COMMENT 'Rule group name',
    `description` VARCHAR(500) DEFAULT NULL,
    `data_source_id` BIGINT NOT NULL COMMENT 'FK to data_source_config',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=enabled 0=disabled',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_data_source_id` (`data_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rule group';

-- Rule definition: individual validation rule
CREATE TABLE IF NOT EXISTS `rule_definition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT NOT NULL COMMENT 'FK to rule_group',
    `rule_level` VARCHAR(20) NOT NULL DEFAULT 'FIELD' COMMENT 'TABLE or FIELD level rule',
    `field_name` VARCHAR(200) NOT NULL COMMENT 'Column/field to validate',
    `rule_type` VARCHAR(50) NOT NULL COMMENT 'Rule type',
    `rule_params` JSON DEFAULT NULL COMMENT 'Rule parameters as JSON',
    `custom_sql` TEXT DEFAULT NULL COMMENT 'Custom SQL for this rule',
    `description` VARCHAR(500) DEFAULT NULL COMMENT 'Rule description',
    `importance_level` VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT 'IMPORTANT or NORMAL',
    `rule_weight` INT NOT NULL DEFAULT 1 COMMENT 'Weight: IMPORTANT=3, NORMAL=1',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Execution order',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=enabled 0=disabled',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`),
    KEY `idx_field_name` (`field_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rule definition';

-- Quality report
CREATE TABLE IF NOT EXISTS `quality_report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `rule_group_id` BIGINT NOT NULL,
    `table_name` VARCHAR(200),
    `table_label` VARCHAR(200),
    `total_score` DECIMAL(8,2) NOT NULL DEFAULT 0,
    `score_level` VARCHAR(20) COMMENT 'excellent/good/medium/poor',
    `total_rows` BIGINT DEFAULT 0,
    `total_rules` INT DEFAULT 0,
    `passed_rules` INT DEFAULT 0,
    `failed_rules` INT DEFAULT 0,
    `execution_id` BIGINT,
    `report_data` JSON COMMENT 'Full report data',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_rule_group` (`rule_group_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work order
CREATE TABLE IF NOT EXISTS `work_order` (
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
    KEY `idx_status` (`status`),
    KEY `idx_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work order issue items
CREATE TABLE IF NOT EXISTS `work_order_issue` (
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

-- Work order flow log
CREATE TABLE IF NOT EXISTS `work_order_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `operator` VARCHAR(100),
    `operator_dept` VARCHAR(200),
    `comment` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dictionary table for domain value validation
CREATE TABLE IF NOT EXISTS `dict_table` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_code` VARCHAR(100) NOT NULL COMMENT 'Dictionary code, e.g. TABLE_19',
    `dict_name` VARCHAR(200) NOT NULL COMMENT 'Dictionary name',
    `description` VARCHAR(500) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dictionary table';

-- Dictionary items
CREATE TABLE IF NOT EXISTS `dict_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_code` VARCHAR(100) NOT NULL COMMENT 'FK to dict_table.dict_code',
    `item_value` VARCHAR(200) NOT NULL COMMENT 'Valid value',
    `item_label` VARCHAR(200) DEFAULT NULL COMMENT 'Display label',
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_dict_code` (`dict_code`),
    KEY `idx_dict_code_value` (`dict_code`, `item_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dictionary items';

-- Execution history
CREATE TABLE IF NOT EXISTS `execution_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rule_group_id` BIGINT NOT NULL,
    `rule_group_name` VARCHAR(200) DEFAULT NULL,
    `total_rows` BIGINT NOT NULL DEFAULT 0 COMMENT 'Total data rows',
    `total_rules` INT NOT NULL DEFAULT 0,
    `passed_rules` INT NOT NULL DEFAULT 0,
    `failed_rules` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'RUNNING' COMMENT 'RUNNING, COMPLETED, FAILED',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME DEFAULT NULL,
    `duration_ms` BIGINT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`),
    KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Execution record';

-- Execution detail per rule
CREATE TABLE IF NOT EXISTS `execution_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `execution_id` BIGINT NOT NULL COMMENT 'FK to execution_record',
    `rule_id` BIGINT NOT NULL COMMENT 'FK to rule_definition',
    `field_name` VARCHAR(200) NOT NULL,
    `rule_type` VARCHAR(50) NOT NULL,
    `rule_description` VARCHAR(500) DEFAULT NULL,
    `total_rows` BIGINT NOT NULL DEFAULT 0 COMMENT 'Total data rows checked',
    `violated_rows` BIGINT NOT NULL DEFAULT 0 COMMENT 'Rows violating the rule',
    `compliance_rate` DECIMAL(8,4) NOT NULL DEFAULT 0 COMMENT 'Compliance rate percentage',
    `quality_result` VARCHAR(20) NOT NULL DEFAULT 'PASS' COMMENT 'PASS or FAIL',
    `sample_violations` JSON DEFAULT NULL COMMENT 'Sample of violating data (max 10)',
    `duration_ms` BIGINT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_execution_id` (`execution_id`),
    KEY `idx_rule_id` (`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Execution detail per rule';
