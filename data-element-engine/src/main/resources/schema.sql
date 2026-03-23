-- ============================================================================
-- 数据要素平台-规则引擎 数据库表结构 (dep_ 前缀)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `dep_data_source_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '数据源名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '数据源描述',
    `db_type` VARCHAR(20) NOT NULL DEFAULT 'MYSQL' COMMENT '数据库类型: MYSQL/ORACLE/HIVE',
    `db_url` VARCHAR(500) NOT NULL COMMENT 'JDBC连接URL',
    `db_username` VARCHAR(100) NOT NULL COMMENT '数据库用户名',
    `db_password` VARCHAR(200) NOT NULL COMMENT '数据库密码',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1=启用 0=禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据源配置表';

CREATE TABLE IF NOT EXISTS `dep_rule_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(200) NOT NULL COMMENT '规则组名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '规则组描述',
    `data_source_id` BIGINT NOT NULL COMMENT '关联数据源ID',
    `table_name` VARCHAR(200) DEFAULT NULL COMMENT '校验目标表名',
    `table_label` VARCHAR(200) DEFAULT NULL COMMENT '表中文名称',
    `query_sql` TEXT DEFAULT NULL COMMENT '自定义查询SQL(可选,优先于表名)',
    `specified_fields` TEXT DEFAULT NULL COMMENT '查询字段(逗号分隔,默认*)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1=启用 0=禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_data_source_id` (`data_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则组表-一个规则组对应一张业务表的校验规则集';

CREATE TABLE IF NOT EXISTS `dep_rule_definition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_group_id` BIGINT NOT NULL COMMENT '所属规则组ID',
    `rule_level` VARCHAR(20) NOT NULL DEFAULT 'FIELD' COMMENT '规则级别: TABLE=表级 FIELD=字段级',
    `field_name` VARCHAR(200) NOT NULL COMMENT '校验字段名',
    `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型编码(如NOT_NULL/SCRIPT等)',
    `rule_params` JSON DEFAULT NULL COMMENT '规则参数(JSON格式)',
    `custom_sql` TEXT DEFAULT NULL COMMENT '自定义SQL条件表达式',
    `script_body` TEXT DEFAULT NULL COMMENT '动态脚本代码(SCRIPT类型)',
    `script_language` VARCHAR(20) DEFAULT NULL COMMENT '脚本语言: java/js',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '规则描述',
    `importance_level` VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '重要程度: IMPORTANT/NORMAL',
    `rule_weight` INT NOT NULL DEFAULT 1 COMMENT '权重: 重要=3 一般=1',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '执行排序号',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1=启用 0=禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则定义表-具体的校验规则配置';

CREATE TABLE IF NOT EXISTS `dep_quality_report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `rule_group_id` BIGINT NOT NULL COMMENT '规则组ID',
    `task_id` BIGINT DEFAULT NULL COMMENT '关联主任务ID',
    `table_name` VARCHAR(200) COMMENT '校验表名',
    `table_label` VARCHAR(200) COMMENT '表中文名',
    `total_score` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '质量总评分(0-100)',
    `score_level` VARCHAR(20) COMMENT '评分等级: excellent/good/medium/poor',
    `total_rows` BIGINT DEFAULT 0 COMMENT '数据总行数',
    `total_rules` INT DEFAULT 0 COMMENT '规则总数',
    `passed_rules` INT DEFAULT 0 COMMENT '通过规则数',
    `failed_rules` INT DEFAULT 0 COMMENT '失败规则数',
    `execution_id` BIGINT COMMENT '关联执行记录ID',
    `report_data` JSON COMMENT '报告详情数据(JSON)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
    KEY `idx_rule_group` (`rule_group_id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质量报告表-每次任务执行后生成的质量评分报告';

CREATE TABLE IF NOT EXISTS `dep_work_order` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '工单编号',
    `title` VARCHAR(500) NOT NULL COMMENT '工单标题',
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT '工单状态: PENDING/PROCESSING/COMPLETED/REJECTED',
    `urgency` VARCHAR(20) DEFAULT 'NORMAL' COMMENT '紧急程度',
    `issue_type` VARCHAR(50) DEFAULT 'ACCURACY' COMMENT '问题类型',
    `report_id` BIGINT COMMENT '关联质量报告ID',
    `rule_group_id` BIGINT COMMENT '关联规则组ID',
    `table_name` VARCHAR(200) COMMENT '相关表名',
    `data_source_unit` VARCHAR(200) COMMENT '数据源单位',
    `issue_description` TEXT COMMENT '问题描述',
    `issue_impact` TEXT COMMENT '问题影响',
    `suggestion` TEXT COMMENT '整改建议',
    `process_instance_id` VARCHAR(100) COMMENT 'Flowable流程实例ID',
    `assignee` VARCHAR(100) COMMENT '处理人',
    `created_by` VARCHAR(100) COMMENT '创建人',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题处置工单表';

CREATE TABLE IF NOT EXISTS `dep_work_order_issue` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `order_id` BIGINT NOT NULL COMMENT '工单ID',
    `field_name` VARCHAR(200) COMMENT '问题字段名',
    `field_code` VARCHAR(200) COMMENT '字段编码',
    `issue_type` VARCHAR(50) COMMENT '问题类型',
    `rule_description` VARCHAR(500) COMMENT '规则描述',
    `issue_count` BIGINT DEFAULT 0 COMMENT '问题数量',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单问题明细表';

CREATE TABLE IF NOT EXISTS `dep_work_order_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `order_id` BIGINT NOT NULL COMMENT '工单ID',
    `action` VARCHAR(50) NOT NULL COMMENT '操作动作',
    `operator` VARCHAR(100) COMMENT '操作人',
    `operator_dept` VARCHAR(200) COMMENT '操作人部门',
    `comment` TEXT COMMENT '操作备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单操作日志表';

CREATE TABLE IF NOT EXISTS `dep_dict_table` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `dict_code` VARCHAR(100) NOT NULL COMMENT '字典编码',
    `dict_name` VARCHAR(200) NOT NULL COMMENT '字典名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '字典描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典表-值域校验使用的字典定义';

CREATE TABLE IF NOT EXISTS `dep_dict_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `dict_code` VARCHAR(100) NOT NULL COMMENT '字典编码',
    `item_value` VARCHAR(200) NOT NULL COMMENT '字典值',
    `item_label` VARCHAR(200) DEFAULT NULL COMMENT '显示标签',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序号',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典项表-字典的具体值列表';

CREATE TABLE IF NOT EXISTS `dep_execution_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_group_id` BIGINT NOT NULL COMMENT '规则组ID',
    `rule_group_name` VARCHAR(200) DEFAULT NULL COMMENT '规则组名称',
    `total_rows` BIGINT NOT NULL DEFAULT 0 COMMENT '校验数据总行数',
    `total_rules` INT NOT NULL DEFAULT 0 COMMENT '规则总数',
    `passed_rules` INT NOT NULL DEFAULT 0 COMMENT '通过规则数',
    `failed_rules` INT NOT NULL DEFAULT 0 COMMENT '失败规则数',
    `status` VARCHAR(20) NOT NULL DEFAULT 'RUNNING' COMMENT '状态: RUNNING/COMPLETED/FAILED/CANCELLED',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `duration_ms` BIGINT DEFAULT NULL COMMENT '执行耗时(毫秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行记录表-每次规则组执行的汇总记录';

CREATE TABLE IF NOT EXISTS `dep_execution_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `execution_id` BIGINT NOT NULL COMMENT '执行记录ID',
    `rule_id` BIGINT NOT NULL COMMENT '规则ID',
    `field_name` VARCHAR(200) NOT NULL COMMENT '校验字段名',
    `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型',
    `rule_description` VARCHAR(500) DEFAULT NULL COMMENT '规则描述',
    `total_rows` BIGINT NOT NULL DEFAULT 0 COMMENT '校验行数',
    `violated_rows` BIGINT NOT NULL DEFAULT 0 COMMENT '异常数据行数',
    `compliance_rate` DECIMAL(8,4) NOT NULL DEFAULT 0 COMMENT '合规率(%)',
    `quality_result` VARCHAR(20) NOT NULL DEFAULT 'PASS' COMMENT '校验结果: PASS/FAIL',
    `sample_violations` JSON DEFAULT NULL COMMENT '异常数据样本(JSON,最多10条)',
    `duration_ms` BIGINT DEFAULT NULL COMMENT '执行耗时(毫秒)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_execution_id` (`execution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行明细表-每条规则的校验结果';

CREATE TABLE IF NOT EXISTS `dep_execution_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主任务ID',
    `rule_group_id` BIGINT COMMENT '规则组ID',
    `rule_group_name` VARCHAR(200) COMMENT '规则组名称',
    `status` VARCHAR(30) COMMENT '状态: QUEUED/RUNNING/COMPLETED/FAILED/CANCELLED',
    `priority` INT DEFAULT 0 COMMENT '优先级',
    `total_rules` INT DEFAULT 0 COMMENT '规则总数',
    `completed_rules` INT DEFAULT 0 COMMENT '已完成规则数',
    `current_step` VARCHAR(200) COMMENT '当前步骤描述',
    `progress` INT DEFAULT 0 COMMENT '进度(0-100)',
    `execution_id` BIGINT COMMENT '执行记录ID',
    `thread_name` VARCHAR(100) COMMENT '执行线程名',
    `cpu_usage_pct` DECIMAL(5,2) COMMENT 'CPU使用率(%)',
    `memory_usage_mb` BIGINT COMMENT '内存使用(MB)',
    `error_message` TEXT COMMENT '错误信息',
    `queued_at` DATETIME COMMENT '入队时间',
    `started_at` DATETIME COMMENT '开始执行时间',
    `finished_at` DATETIME COMMENT '完成时间',
    `duration_ms` BIGINT COMMENT '执行耗时(毫秒)',
    `created_by` VARCHAR(100) COMMENT '创建人',
    `data_source_id` BIGINT COMMENT '数据源ID',
    `total_rows` BIGINT DEFAULT 0 COMMENT '数据总行数',
    `sub_task_count` INT DEFAULT 0 COMMENT '子任务总数',
    `completed_sub_tasks` INT DEFAULT 0 COMMENT '已完成子任务数',
    `batch_size` INT DEFAULT 10000 COMMENT '子任务批次大小',
    `max_concurrent_sub_tasks` INT DEFAULT 10 COMMENT '最大并发子任务数',
    `max_sub_task_timeout_sec` INT DEFAULT 60 COMMENT '子任务超时(秒)',
    `specified_fields` TEXT COMMENT '查询字段(逗号分隔)',
    `time_filter_field` VARCHAR(200) COMMENT '时间过滤字段',
    `time_range_start` VARCHAR(50) COMMENT '时间范围起',
    `time_range_end` VARCHAR(50) COMMENT '时间范围止',
    `primary_key_field` VARCHAR(200) COMMENT '主键字段',
    `row_limit` BIGINT COMMENT '最大数据条数限制',
    `powerjob_instance_id` VARCHAR(100) COMMENT 'PowerJob实例ID(调度触发时)',
    `table_name` VARCHAR(200) COMMENT '校验表名',
    `report_id` BIGINT COMMENT '质量报告ID(执行完自动生成)',
    `cron_expression` VARCHAR(100) DEFAULT NULL COMMENT 'Cron定时表达式',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_rule_group` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主任务表-一次数据质量检测的主任务';

CREATE TABLE IF NOT EXISTS `dep_execution_sub_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '子任务ID',
    `task_id` BIGINT NOT NULL COMMENT '主任务ID',
    `sub_task_index` INT NOT NULL COMMENT '子任务序号',
    `status` VARCHAR(30) NOT NULL DEFAULT 'QUEUED' COMMENT '状态: QUEUED/RUNNING/COMPLETED/FAILED/CANCELLED',
    `offset_start` BIGINT DEFAULT 0 COMMENT '数据偏移起始位',
    `offset_end` BIGINT DEFAULT 0 COMMENT '数据偏移结束位',
    `row_count` BIGINT DEFAULT 0 COMMENT '实际处理行数',
    `processed_rules` INT DEFAULT 0 COMMENT '已执行规则数',
    `total_rules` INT DEFAULT 0 COMMENT '总规则数',
    `violated_count` BIGINT DEFAULT 0 COMMENT '异常数据总数',
    `passed_count` BIGINT DEFAULT 0 COMMENT '通过规则数',
    `thread_name` VARCHAR(100) COMMENT '执行线程名',
    `cpu_usage_pct` DECIMAL(5,2) COMMENT 'CPU使用率(%)',
    `memory_usage_mb` BIGINT COMMENT '内存使用(MB)',
    `error_message` TEXT COMMENT '错误信息',
    `started_at` DATETIME COMMENT '开始时间',
    `finished_at` DATETIME COMMENT '完成时间',
    `duration_ms` BIGINT COMMENT '执行耗时(毫秒)',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表-主任务拆分的数据分片子任务';

CREATE TABLE IF NOT EXISTS `dep_execution_step_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '步骤日志ID',
    `task_id` BIGINT COMMENT '主任务ID',
    `step_index` INT COMMENT '步骤序号',
    `step_name` VARCHAR(200) COMMENT '步骤名称',
    `rule_id` BIGINT COMMENT '规则ID',
    `field_name` VARCHAR(200) COMMENT '字段名',
    `rule_type` VARCHAR(50) COMMENT '规则类型',
    `status` VARCHAR(30) COMMENT '状态',
    `total_rows` BIGINT DEFAULT 0 COMMENT '校验行数',
    `violated_rows` BIGINT DEFAULT 0 COMMENT '异常数据行数',
    `duration_ms` BIGINT COMMENT '执行耗时(毫秒)',
    `memory_delta_mb` BIGINT COMMENT '内存变化(MB)',
    `error_message` TEXT COMMENT '错误信息',
    `started_at` DATETIME COMMENT '开始时间',
    `finished_at` DATETIME COMMENT '完成时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行步骤日志表-每个子任务中每条规则的执行日志';

CREATE TABLE IF NOT EXISTS `dep_execution_violation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '异常数据ID',
    `execution_id` BIGINT COMMENT '执行记录ID',
    `task_id` BIGINT COMMENT '主任务ID',
    `detail_id` BIGINT COMMENT '执行明细ID',
    `rule_type` VARCHAR(50) COMMENT '规则类型',
    `field_name` VARCHAR(200) COMMENT '异常字段名',
    `row_index` BIGINT COMMENT '行号',
    `row_data` TEXT COMMENT '异常行完整数据(JSON)',
    `field_value` TEXT COMMENT '异常字段值',
    `violation_reason` VARCHAR(500) COMMENT '异常原因',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发现时间',
    PRIMARY KEY (`id`),
    KEY `idx_execution_id` (`execution_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_detail_id` (`detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异常数据明细表-每条校验不通过的数据记录,支持下钻查看';

CREATE TABLE IF NOT EXISTS `dep_rule_type_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `type_code` VARCHAR(50) NOT NULL COMMENT '规则类型编码(如NOT_NULL/SCRIPT)',
    `type_name` VARCHAR(200) COMMENT '规则类型名称',
    `rule_level` VARCHAR(20) DEFAULT 'FIELD' COMMENT '规则级别: TABLE/FIELD',
    `description` TEXT COMMENT '详细说明(含用途/场景/参数说明/示例)',
    `default_params` JSON COMMENT '默认参数(JSON)',
    `needs_params` INT DEFAULT 0 COMMENT '是否需要参数: 0=否 1=是',
    `param_template` TEXT COMMENT '参数模板/提示(JSON)',
    `dict_code` VARCHAR(100) COMMENT '关联字典编码',
    `status` INT DEFAULT 1 COMMENT '状态: 1=启用 0=禁用',
    `sort_order` INT DEFAULT 0 COMMENT '排序号',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则类型配置表-系统支持的校验规则类型定义';

CREATE TABLE IF NOT EXISTS `dep_rule_chain` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_group_id` BIGINT COMMENT '规则组ID',
    `chain_name` VARCHAR(200) COMMENT '规则链名称',
    `field_name` VARCHAR(200) COMMENT '字段名',
    `chain_el` TEXT COMMENT 'LiteFlow EL表达式',
    `logic_type` VARCHAR(20) COMMENT '逻辑类型',
    `description` VARCHAR(500) COMMENT '描述',
    `status` INT DEFAULT 1 COMMENT '状态: 1=启用 0=禁用',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_rule_group_id` (`rule_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则链表-LiteFlow规则编排链';
