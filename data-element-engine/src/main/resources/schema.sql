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
    `field_name` VARCHAR(200) NOT NULL COMMENT 'Column/field to validate',
    `rule_type` VARCHAR(50) NOT NULL COMMENT 'Rule type: NOT_NULL, UNIQUE, LENGTH, REGEX, DATE_FORMAT, ID_CARD, PHONE, DOMAIN_CHECK, CUSTOM_SQL, TABLE_ROW_COUNT, ENCODING_RULE, INVALID_CONTENT',
    `rule_params` JSON DEFAULT NULL COMMENT 'Rule parameters as JSON',
    `description` VARCHAR(500) DEFAULT NULL COMMENT 'Rule description',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Execution order',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1=enabled 0=disabled',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`),
    KEY `idx_field_name` (`field_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rule definition';

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
