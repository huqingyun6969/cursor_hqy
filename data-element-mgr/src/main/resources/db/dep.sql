-- ============================================================
-- 数据要素平台 - 数据库建表脚本
-- 数据库: data_element_platform
-- 字符集: utf8mb4
-- ============================================================

-- -----------------------------------------------------------
-- 1. 标准集目录 (标准文档目录/标准集)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_catalog` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`        VARCHAR(200) NOT NULL COMMENT '目录名称',
    `parent_id`   BIGINT       DEFAULT 0 COMMENT '父级ID，0=根节点',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序号',
    `created_by`  VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`  VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标准集目录';

-- -----------------------------------------------------------
-- 2. 标准文档 (Standard Document)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_document` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`           VARCHAR(200) NOT NULL COMMENT '标准名称',
    `code`           VARCHAR(100) DEFAULT NULL COMMENT '编号',
    `type_category`  VARCHAR(50)  DEFAULT NULL COMMENT '标准类型分类',
    `compile_unit`   VARCHAR(200) DEFAULT NULL COMMENT '编制单位',
    `usage_desc`     VARCHAR(500) DEFAULT NULL COMMENT '用途说明',
    `task_exec_link` VARCHAR(200) DEFAULT NULL COMMENT '任务执行环节',
    `catalog_id`     BIGINT       DEFAULT NULL COMMENT '所属目录ID',
    `attachment_url`  VARCHAR(500) DEFAULT NULL COMMENT '附件URL',
    `attachment_name` VARCHAR(200) DEFAULT NULL COMMENT '附件名称',
    `status`         VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' COMMENT '状态: DRAFT/REVIEWING/APPROVED/REJECTED/REVOKED',
    `created_by`     VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`     VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_catalog_id` (`catalog_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标准文档';

-- -----------------------------------------------------------
-- 3. 标准文档细则 (Document Detail Rules)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_doc_rule` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `document_id` BIGINT       NOT NULL COMMENT '标准文档ID',
    `code`        VARCHAR(50)  DEFAULT NULL COMMENT '编号 如DE001',
    `group_type`  VARCHAR(100) DEFAULT NULL COMMENT '细则类型',
    `group_label` VARCHAR(200) DEFAULT NULL COMMENT '细则标签',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '细则描述',
    `created_by`  VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`  VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标准文档细则';

-- -----------------------------------------------------------
-- 4. 审批流程记录 (Approval Flow Log)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_approval` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `document_id` BIGINT       NOT NULL COMMENT '标准文档ID',
    `action`      VARCHAR(50)  NOT NULL COMMENT '动作: CREATE/SUBMIT/APPROVE/REJECT',
    `operator`    VARCHAR(100) DEFAULT NULL COMMENT '操作人',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `operated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    `created_by`  VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`  VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批流程记录';

-- -----------------------------------------------------------
-- 5. 数据标准集 (Standard Set / Collection)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_set` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`         VARCHAR(200) NOT NULL COMMENT '标准名称',
    `code`         VARCHAR(100) DEFAULT NULL COMMENT '标准编码',
    `set_catalog`  VARCHAR(200) DEFAULT NULL COMMENT '所属标准集',
    `description`  VARCHAR(500) DEFAULT NULL COMMENT '标准描述',
    `status`       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/OFFLINE/REVOKED',
    `created_by`   VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`   VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据标准集';

-- -----------------------------------------------------------
-- 6. 数据标准 (Data Standard - single standard definition)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_info` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `set_id`          BIGINT       NOT NULL COMMENT '所属标准集ID',
    `std_code`        VARCHAR(100) DEFAULT NULL COMMENT '标准编号',
    `std_name`        VARCHAR(200) NOT NULL COMMENT '标准名称',
    `en_name`         VARCHAR(200) DEFAULT NULL COMMENT '英文名称',
    `std_alias`       VARCHAR(200) DEFAULT NULL COMMENT '标准别名',
    `std_content`     TEXT         DEFAULT NULL COMMENT '标准内容',
    `remark`          VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `biz_rule`        VARCHAR(200) DEFAULT NULL COMMENT '业务规则',
    `biz_definition`  VARCHAR(500) DEFAULT NULL COMMENT '业务定义',
    `custom_def`      VARCHAR(500) DEFAULT NULL COMMENT '定义依据',
    `value_range`     VARCHAR(200) DEFAULT NULL COMMENT '取值范围',
    `data_type`       VARCHAR(50)  DEFAULT NULL COMMENT '数据类型',
    `unit`            VARCHAR(50)  DEFAULT NULL COMMENT '计量单位',
    `nullable`        TINYINT      DEFAULT 1 COMMENT '是否可为空: 1=是 0=否',
    `is_unique`       TINYINT      DEFAULT 0 COMMENT '是否唯一值: 1=是 0=否',
    `value_length`    VARCHAR(50)  DEFAULT NULL COMMENT '数值长度',
    `value_min`       VARCHAR(50)  DEFAULT NULL COMMENT '最小值',
    `value_max`       VARCHAR(50)  DEFAULT NULL COMMENT '最大值',
    `auth_system`     VARCHAR(200) DEFAULT NULL COMMENT '权威系统',
    `std_def_dept`    VARCHAR(200) DEFAULT NULL COMMENT '标准定义部门',
    `std_manager`     VARCHAR(100) DEFAULT NULL COMMENT '标准管理人员',
    `std_use_dept`    VARCHAR(200) DEFAULT NULL COMMENT '标准使用部门',
    `feature_tag`     VARCHAR(200) DEFAULT NULL COMMENT '特征标签',
    `status`          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/OFFLINE',
    `created_by`      VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`      VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_set_id` (`set_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据标准';

-- -----------------------------------------------------------
-- 7. 落标配置规则 (Standard Landing Rules)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_rule` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `std_info_id`    BIGINT       NOT NULL COMMENT '数据标准ID',
    `rule_name`      VARCHAR(200) NOT NULL COMMENT '规则名称',
    `group_type`     VARCHAR(100) DEFAULT NULL COMMENT '组别类型',
    `rule_type`      VARCHAR(100) DEFAULT NULL COMMENT '规则类型',
    `rule_desc`      VARCHAR(500) DEFAULT NULL COMMENT '规则描述',
    `check_rule`     VARCHAR(200) DEFAULT NULL COMMENT '检测规则',
    `created_by`     VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`     VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_std_info_id` (`std_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='落标配置规则';

-- -----------------------------------------------------------
-- 8. 关联标准细则 (Standard Related Documents)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_ref_doc` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `std_info_id`   BIGINT       NOT NULL COMMENT '数据标准ID',
    `doc_name`      VARCHAR(200) DEFAULT NULL COMMENT '文档名称',
    `doc_desc`      VARCHAR(500) DEFAULT NULL COMMENT '细则描述',
    `doc_catalog`   VARCHAR(200) DEFAULT NULL COMMENT '所属目录',
    `effective_at`  DATETIME     DEFAULT NULL COMMENT '生效时间',
    `doc_url`       VARCHAR(500) DEFAULT NULL COMMENT '文档URL',
    `created_by`    VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`    VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_std_info_id` (`std_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关联标准细则';

-- -----------------------------------------------------------
-- 9. 落标映射 - 资源对象 (Mapping Resource Object)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_map_resource` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `resource_name`    VARCHAR(200) NOT NULL COMMENT '资源对象名称',
    `resource_code`    VARCHAR(200) DEFAULT NULL COMMENT '资源对象编码',
    `data_source`      VARCHAR(200) DEFAULT NULL COMMENT '数据来源',
    `field_count`      INT          DEFAULT 0 COMMENT '映射字段对象数',
    `std_count`        INT          DEFAULT 0 COMMENT '映射标准数',
    `owner_dept`       VARCHAR(200) DEFAULT NULL COMMENT '资源所属部门',
    `created_by`       VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`       VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='落标映射资源对象';

-- -----------------------------------------------------------
-- 10. 落标映射 - 字段映射 (Field Mapping)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_map_field` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `resource_id`    BIGINT       NOT NULL COMMENT '资源对象ID',
    `field_name`     VARCHAR(200) NOT NULL COMMENT '字段名称',
    `field_code`     VARCHAR(200) DEFAULT NULL COMMENT '字段编码',
    `field_type`     VARCHAR(50)  DEFAULT NULL COMMENT '字段类型',
    `importance`     VARCHAR(20)  DEFAULT '一般' COMMENT '重要级别: 重要/一般',
    `feature_tag`    VARCHAR(200) DEFAULT NULL COMMENT '特征标签',
    `std_configured` VARCHAR(20)  DEFAULT '未配置' COMMENT '数据标准: 数据标准名/未配置',
    `quality_rule`   VARCHAR(200) DEFAULT NULL COMMENT '其他质量规则',
    `created_by`     VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`     VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='落标映射字段';

-- -----------------------------------------------------------
-- 11. 标准首页统计快照 (Dashboard Statistics)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dep_std_dashboard` (
    `id`                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `snapshot_date`       DATE         NOT NULL COMMENT '快照日期',
    `landing_rate`        DECIMAL(5,2) DEFAULT 0 COMMENT '标准落地率(%)',
    `landing_rate_delta`  DECIMAL(5,2) DEFAULT 0 COMMENT '较上月变化(%)',
    `landing_table_count` INT          DEFAULT 0 COMMENT '落标库表数',
    `landing_table_delta` DECIMAL(5,2) DEFAULT 0 COMMENT '落标库表较上月(%)',
    `covered_std_count`   INT          DEFAULT 0 COMMENT '已覆盖标准数',
    `covered_std_delta`   DECIMAL(5,2) DEFAULT 0 COMMENT '已覆盖较上月(%)',
    `unlanded_std_count`  INT          DEFAULT 0 COMMENT '未落地标准数',
    `unlanded_std_delta`  DECIMAL(5,2) DEFAULT 0 COMMENT '未落地较上周(%)',
    `created_by`          VARCHAR(64)  DEFAULT NULL COMMENT '创建人',
    `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_by`          VARCHAR(64)  DEFAULT NULL COMMENT '修改人',
    `updated_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_snapshot_date` (`snapshot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标准首页统计快照';
