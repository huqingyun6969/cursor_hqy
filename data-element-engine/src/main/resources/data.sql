-- ============================================================================
-- 内置规则类型初始化数据 (INSERT IGNORE: 幂等，已存在则跳过)
-- ============================================================================

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('NOT_NULL', '非空校验', 'FIELD',
 '【用途】检查指定字段值是否为空(NULL或空字符串)\n【适用场景】必填字段校验，如姓名、证件号、手机号等关键字段\n【示例】字段 CORP_NAME 不允许为空\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 1);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('IS_NULL', '空值校验', 'FIELD',
 '【用途】检查字段值是否全部为空(与非空校验相反，找出有值但不应有值的行)\n【适用场景】废弃字段、保留字段不应有值的场景\n【示例】字段 DELETED_REMARK 在未删除记录中应为空\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 2);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('UNIQUE', '唯一性校验', 'FIELD',
 '【用途】检查字段值是否唯一，找出重复值\n【适用场景】主键、唯一标识、证件号等不应重复的字段\n【示例】字段 ID_CARD_NO(身份证号) 不应有重复值\n【无需参数】直接选择即可，系统会统计重复值及重复次数',
 0, NULL, NULL, 1, 3);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('LENGTH', '长度校验', 'FIELD',
 '【用途】检查字段值的字符长度是否在指定范围内\n【适用场景】固定长度编码(如6位邮编)、最大长度限制、最小长度要求\n【参数说明】\n  min: 最小长度(含)，默认0\n  max: 最大长度(含)，默认无限\n  exact: 精确长度(设置后min/max无效)\n【示例1】邮编必须6位: {"exact":6}\n【示例2】姓名2-20个字符: {"min":2,"max":20}',
 1, '{"min":0,"max":100}',
 '{"min":"最小长度(含)，如 2","max":"最大长度(含)，如 50","exact":"精确长度(设置后min/max无效)，如 6"}', 1, 4);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('REGEX', '正则表达式校验', 'FIELD',
 '【用途】使用正则表达式校验字段值的格式\n【适用场景】自定义格式验证，如邮箱、URL、特定编码格式等\n【参数说明】\n  pattern: Java正则表达式\n【示例1】邮箱格式: {"pattern":"^[\\\\w.-]+@[\\\\w.-]+\\\\.[a-zA-Z]{2,}$"}\n【示例2】纯数字: {"pattern":"^\\\\d+$"}\n【示例3】以A开头: {"pattern":"^A.*"}',
 1, '{"pattern":".*"}',
 '{"pattern":"Java正则表达式，如 ^\\\\d{6}$ 表示6位数字"}', 1, 5);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DATE_FORMAT', '日期格式校验', 'FIELD',
 '【用途】检查日期/时间字段是否符合指定的格式\n【适用场景】日期字段格式统一性校验\n【参数说明】\n  format: Java日期格式模式(SimpleDateFormat)\n【示例1】标准日期: {"format":"yyyy-MM-dd"}\n【示例2】带时间: {"format":"yyyy-MM-dd HH:mm:ss"}\n【示例3】年月: {"format":"yyyy-MM"}',
 1, '{"format":"yyyy-MM-dd"}',
 '{"format":"日期格式，如 yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss"}', 1, 6);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DATE_RANGE', '日期范围校验', 'FIELD',
 '【用途】检查日期字段值是否在指定的时间范围内\n【适用场景】业务合理性校验，如注册日期不应早于公司成立日期\n【参数说明】\n  minDate: 最早日期(yyyy-MM-dd格式)\n  maxDate: 最晚日期(yyyy-MM-dd格式)\n  format: 日期解析格式(可选，默认yyyy-MM-dd)\n【示例】2020年至今: {"minDate":"2020-01-01","maxDate":"2099-12-31"}',
 1, '{"minDate":"2000-01-01","maxDate":"2099-12-31"}',
 '{"minDate":"最早日期(yyyy-MM-dd)","maxDate":"最晚日期(yyyy-MM-dd)","format":"日期解析格式(可选)"}', 1, 7);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('ID_CARD', '身份证校验', 'FIELD',
 '【用途】校验18位中国大陆身份证号码的合法性，包括：长度、格式、地区码、出生日期、校验位\n【适用场景】身份证号字段的完整性校验\n【校验规则】\n  1. 必须为18位\n  2. 前17位为数字\n  3. 第18位为数字或X\n  4. 加权校验码验证\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 8);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('PHONE', '手机号校验', 'FIELD',
 '【用途】校验中国大陆手机号码格式\n【适用场景】手机号字段格式校验\n【校验规则】1开头，第2位为3-9，共11位数字\n【正则】^1[3-9]\\d{9}$\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 9);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('LANDLINE', '座机号码校验', 'FIELD',
 '【用途】校验固定电话号码格式(同时兼容手机号)\n【适用场景】联系电话字段，可能是手机或座机\n【校验规则】\n  座机: 区号(0开头2-3位) + 号码(7-8位)，如 010-12345678\n  手机: 1[3-9]开头11位\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 10);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('FAX', '传真号码校验', 'FIELD',
 '【用途】校验传真号码格式(与座机格式相同)\n【适用场景】传真号字段格式校验\n【校验规则】区号(0开头2-3位) + 号码(7-8位)\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 11);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('POSTCODE', '邮编校验', 'FIELD',
 '【用途】校验中国邮政编码格式\n【适用场景】邮编字段格式校验\n【校验规则】6位数字，首位不为0\n【正则】^[1-9]\\d{5}$\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 12);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('SOCIAL_CREDIT_CODE', '统一社会信用代码校验', 'FIELD',
 '【用途】校验18位统一社会信用代码的合法性(含加权校验位)\n【适用场景】企业信用代码字段校验\n【校验规则】\n  1. 必须为18位\n  2. 由数字和大写字母组成(排除I,O,Z,S,V)\n  3. 第18位为加权校验码\n【无需参数】直接选择即可',
 0, NULL, NULL, 1, 13);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('ENCODING_RULE', '编码规则校验', 'FIELD',
 '【用途】校验字段值是否符合指定的编码规则(如行政区划代码、行业代码等)\n【适用场景】标准编码字段的格式校验\n【参数说明】\n  pattern: 编码的正则表达式\n  prefix: 必须的前缀(可选)\n  length: 编码长度(可选)\n【示例】行政区划6位数字: {"pattern":"^\\\\d{6}$"}',
 1, NULL,
 '{"pattern":"编码正则表达式","prefix":"编码前缀(可选)","length":"编码长度(可选)"}', 1, 14);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DOMAIN_CHECK', '值域校验', 'FIELD',
 '【用途】检查字段值是否在指定的值域(字典表)范围内\n【适用场景】枚举值校验，如性别(男/女)、状态(启用/禁用)、类型代码等\n【使用方式】\n  1. 先在「字典管理」中创建字典表并录入合法值\n  2. 在规则参数中指定字典编码\n【参数说明】\n  dictCode: 字典编码(对应dep_dict_table.dict_code)\n【示例】校验性别字段: {"dictCode":"GENDER"} (需先创建GENDER字典，包含男、女等值)',
 1, '{"dictCode":""}',
 '{"dictCode":"字典编码，需先在字典管理中创建，如 GENDER、STATUS 等"}', 1, 15);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('INVALID_CONTENT', '无效内容校验', 'FIELD',
 '【用途】检查字段是否包含无效/占位符内容\n【适用场景】检测填写质量，排除占位符数据(如"test"、"null"、"空"、"无"、"*"、"?"等)\n【参数说明】\n  minChineseLen: 中文内容的最小字数(默认1)\n  minCharLen: 非中文内容的最小字符数(默认3)\n【内置无效词】test, null, 空, 无\n【内置无效字符】*, ？, ?\n【示例】{"minChineseLen":2,"minCharLen":3}',
 1, '{"minChineseLen":1,"minCharLen":3}',
 '{"minChineseLen":"中文最小字数(默认1)","minCharLen":"非中文最小字符数(默认3)"}', 1, 16);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('TABLE_ROW_COUNT', '表行数校验', 'TABLE',
 '【用途】校验表的数据行数是否大于指定最小值(表级规则)\n【适用场景】数据完整性校验，确保表不为空或数据量达标\n【参数说明】\n  minRows: 最小行数(含)\n【示例1】表不为空: {"minRows":0}\n【示例2】至少1000条: {"minRows":1000}\n【注意】规则级别需选择「表级规则」，字段名填 / 即可',
 1, '{"minRows":0}',
 '{"minRows":"最小行数(含)，如 0 表示表不能为空，1000 表示至少1000条"}', 1, 17);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('CUSTOM_SQL', '自定义SQL校验', 'FIELD',
 '【用途】通过自定义条件表达式对每行数据进行校验，适用于内置规则无法满足的复杂场景\n\n【配置步骤】\n1. 新建规则 → 规则类型选择「自定义SQL校验」\n2. 字段名填写要校验的目标字段(如 phone)\n3. 在「自定义SQL」输入框中编写条件表达式\n\n【条件表达式语法】(每行数据逐行判断，TRUE=通过，FALSE=违规)\n\n  IS NOT NULL          → 字段不为空则通过\n  IS NULL              → 字段为空则通过\n  LENGTH(field) > 5    → 字段长度>5则通过\n  LENGTH(field) < 20   → 字段长度<20则通过\n  LIKE ''%@%.com''     → 值匹配模式则通过(支持%和_通配符)\n  IN (''男'',''女'')   → 值在列表中则通过\n  COUNT: IS NULL       → 计数模式：空值的行算作违规\n\n【完整示例】\n\n示例1 - 检查手机号长度为11位:\n  字段名: phone\n  自定义SQL: LENGTH(field) > 10\n\n示例2 - 检查性别只能是男/女:\n  字段名: gender\n  自定义SQL: IN (''男'',''女'',''未知'')\n\n示例3 - 检查邮箱格式:\n  字段名: email\n  自定义SQL: LIKE ''%@%''',
 1, NULL, NULL, 1, 18);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('SCRIPT', '动态脚本校验', 'FIELD',
 '【用途】在页面上编写JavaScript或Java动态脚本，后台自动加载执行，实现完全自定义的校验逻辑\n\n【配置步骤】\n1. 新建规则 → 规则类型选择「动态脚本校验」\n2. 字段名填写要校验的目标字段\n3. 选择脚本语言: Java(推荐) 或 JavaScript(ES6)\n4. 在代码编辑器中编写校验逻辑(可点击「插入示例代码」)\n5. 保存后，执行任务时后台会动态加载脚本并执行\n\n【执行原理】\n后台通过LiteFlow的动态脚本节点能力(LiteFlowNodeBuilder.createScriptNode)\n将页面配置的脚本代码动态注册为LiteFlow组件并执行，支持热更新。\n\n【Java脚本示例】(javax-pro引擎，推荐)\nimport com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;\nimport com.yomahub.liteflow.core.NodeComponent;\nimport java.util.List;\nimport java.util.Map;\n\npublic class Demo extends NodeComponent {\n    @Override\n    public void process() throws Exception {\n        RuleContext ctx = this.getContextBean(RuleContext.class);\n        String field = ctx.getCurrentRule().getFieldName();\n        List<Map<String, Object>> rows = ctx.getDataRows();\n        long violated = 0;\n        for (Map<String, Object> row : rows) {\n            Object val = row.get(field);\n            if (val == null) { violated++; ctx.addViolation(field + \"为空\"); }\n        }\n        ctx.setViolatedRows(violated);\n    }\n}\n\n【JavaScript脚本示例】(GraalJS引擎，支持ES6)\nvar RuleContext = Java.type(\"com.iwhalecloud.dep.runengine.liteflow.context.RuleContext\");\nvar ctx = this.getContextBean(RuleContext.class);\nvar field = ctx.getCurrentRule().getFieldName();\nvar rows = ctx.getDataRows();\nvar violated = 0;\nfor (var i = 0; i < rows.size(); i++) {\n    if (rows.get(i).get(field) == null) { violated++; ctx.addViolation(field + \"为空\"); }\n}\nctx.setViolatedRows(violated);\n\n【关键API】\n  ctx.getCurrentRule()    → 获取当前规则定义\n  ctx.getDataRows()      → 获取数据行 List<Map<String,Object>>\n  ctx.getTotalRows()     → 获取总行数\n  ctx.setViolatedRows(n) → 设置违规行数\n  ctx.addViolation(msg)  → 添加违规样本描述(最多10条)',
 1, NULL, NULL, 1, 19);
