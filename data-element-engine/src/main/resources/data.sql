-- Built-in rule types initialization (idempotent via IGNORE + unique key on type_code)

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('NOT_NULL', '非空校验', 'FIELD', '检查字段值是否为空(NULL或空字符串)', 0, NULL, NULL, 1, 1);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('IS_NULL', '空值校验', 'FIELD', '检查字段值是否全部为空', 0, NULL, NULL, 1, 2);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('UNIQUE', '唯一性校验', 'FIELD', '检查字段值是否唯一，无重复值', 0, NULL, NULL, 1, 3);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('LENGTH', '长度校验', 'FIELD', '检查字段值的字符长度是否在指定范围内', 1, '{"min":0,"max":100}', '{"min":"最小长度","max":"最大长度","exact":"精确长度"}', 1, 4);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('REGEX', '正则表达式校验', 'FIELD', '使用正则表达式校验字段值格式', 1, '{"pattern":".*"}', '{"pattern":"正则表达式"}', 1, 5);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DATE_FORMAT', '日期格式校验', 'FIELD', '检查日期字段是否符合指定格式(如yyyy-MM-dd)', 1, '{"format":"yyyy-MM-dd"}', '{"format":"日期格式"}', 1, 6);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DATE_RANGE', '日期范围校验', 'FIELD', '检查日期字段值是否在指定的时间范围内', 1, '{"minDate":"2000-01-01","maxDate":"2099-12-31"}', '{"minDate":"最早日期","maxDate":"最晚日期"}', 1, 7);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('ID_CARD', '身份证校验', 'FIELD', '校验18位身份证号码的合法性(包括校验位)', 0, NULL, NULL, 1, 8);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('PHONE', '手机号校验', 'FIELD', '校验中国大陆手机号码格式(1[3-9]开头的11位数字)', 0, NULL, NULL, 1, 9);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('LANDLINE', '座机号码校验', 'FIELD', '校验固定电话号码格式(区号+号码)', 0, NULL, NULL, 1, 10);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('FAX', '传真号码校验', 'FIELD', '校验传真号码格式', 0, NULL, NULL, 1, 11);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('POSTCODE', '邮编校验', 'FIELD', '校验中国邮政编码格式(6位数字)', 0, NULL, NULL, 1, 12);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('SOCIAL_CREDIT_CODE', '统一社会信用代码校验', 'FIELD', '校验18位统一社会信用代码的合法性(含校验位)', 0, NULL, NULL, 1, 13);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('ENCODING_RULE', '编码规则校验', 'FIELD', '校验字段值是否符合指定编码规则', 1, NULL, NULL, 1, 14);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('DOMAIN_CHECK', '值域校验', 'FIELD', '检查字段值是否在指定的值域(字典)范围内', 1, '{"dictCode":""}', '{"dictCode":"字典编码"}', 1, 15);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('INVALID_CONTENT', '无效内容校验', 'FIELD', '检查字段是否包含无效内容(如test、null、空、无等)', 1, '{"minChineseLen":1,"minCharLen":3}', '{"minChineseLen":"最小中文字数","minCharLen":"最小字符数"}', 1, 16);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('TABLE_ROW_COUNT', '表行数校验', 'TABLE', '校验表的数据行数是否大于指定最小值', 1, '{"minRows":0}', '{"minRows":"最小行数"}', 1, 17);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('CUSTOM_SQL', '自定义SQL校验', 'FIELD', '通过自定义SQL查询进行校验', 1, NULL, NULL, 1, 18);

INSERT IGNORE INTO dep_rule_type_config (type_code, type_name, rule_level, description, needs_params, default_params, param_template, status, sort_order) VALUES
('SCRIPT', '动态脚本校验', 'FIELD', '支持JavaScript(ES6)或Java动态脚本，脚本代码在规则定义中编写', 1, NULL, NULL, 1, 19);
