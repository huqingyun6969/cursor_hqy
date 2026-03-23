package com.iwhalecloud.dep.runengine.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.RuleTypeConfig;
import com.iwhalecloud.dep.runengine.mapper.RuleTypeConfigMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RuleTypeDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RuleTypeDataInitializer.class);

    private final RuleTypeConfigMapper ruleTypeConfigMapper;

    public RuleTypeDataInitializer(RuleTypeConfigMapper ruleTypeConfigMapper) {
        this.ruleTypeConfigMapper = ruleTypeConfigMapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, BuiltinRule> builtins = new LinkedHashMap<>();
        builtins.put("NOT_NULL", new BuiltinRule("非空校验", "FIELD", "检查字段值是否为空(NULL或空字符串)", 0, null, null, 1));
        builtins.put("IS_NULL", new BuiltinRule("空值校验", "FIELD", "检查字段值是否全部为空", 0, null, null, 2));
        builtins.put("UNIQUE", new BuiltinRule("唯一性校验", "FIELD", "检查字段值是否唯一，无重复值", 0, null, null, 3));
        builtins.put("LENGTH", new BuiltinRule("长度校验", "FIELD", "检查字段值的字符长度是否在指定范围内", 1, "{\"min\":0,\"max\":100}", "{\"min\":\"最小长度\",\"max\":\"最大长度\",\"exact\":\"精确长度\"}", 4));
        builtins.put("REGEX", new BuiltinRule("正则表达式校验", "FIELD", "使用正则表达式校验字段值格式", 1, "{\"pattern\":\".*\"}", "{\"pattern\":\"正则表达式\"}", 5));
        builtins.put("DATE_FORMAT", new BuiltinRule("日期格式校验", "FIELD", "检查日期字段是否符合指定格式(如yyyy-MM-dd)", 1, "{\"format\":\"yyyy-MM-dd\"}", "{\"format\":\"日期格式\"}", 6));
        builtins.put("DATE_RANGE", new BuiltinRule("日期范围校验", "FIELD", "检查日期字段值是否在指定的时间范围内", 1, "{\"minDate\":\"2000-01-01\",\"maxDate\":\"2099-12-31\"}", "{\"minDate\":\"最早日期\",\"maxDate\":\"最晚日期\"}", 7));
        builtins.put("ID_CARD", new BuiltinRule("身份证校验", "FIELD", "校验18位身份证号码的合法性(包括校验位)", 0, null, null, 8));
        builtins.put("PHONE", new BuiltinRule("手机号校验", "FIELD", "校验中国大陆手机号码格式(1[3-9]开头的11位数字)", 0, null, null, 9));
        builtins.put("LANDLINE", new BuiltinRule("座机号码校验", "FIELD", "校验固定电话号码格式(区号+号码)", 0, null, null, 10));
        builtins.put("FAX", new BuiltinRule("传真号码校验", "FIELD", "校验传真号码格式", 0, null, null, 11));
        builtins.put("POSTCODE", new BuiltinRule("邮编校验", "FIELD", "校验中国邮政编码格式(6位数字)", 0, null, null, 12));
        builtins.put("SOCIAL_CREDIT_CODE", new BuiltinRule("统一社会信用代码校验", "FIELD", "校验18位统一社会信用代码的合法性(含校验位)", 0, null, null, 13));
        builtins.put("ENCODING_RULE", new BuiltinRule("编码规则校验", "FIELD", "校验字段值是否符合指定编码规则", 1, null, null, 14));
        builtins.put("DOMAIN_CHECK", new BuiltinRule("值域校验", "FIELD", "检查字段值是否在指定的值域(字典)范围内", 1, "{\"dictCode\":\"\"}", "{\"dictCode\":\"字典编码\"}", 15));
        builtins.put("INVALID_CONTENT", new BuiltinRule("无效内容校验", "FIELD", "检查字段是否包含无效内容(如test、null、空、无等占位符)", 1, "{\"minChineseLen\":1,\"minCharLen\":3}", "{\"minChineseLen\":\"最小中文字数\",\"minCharLen\":\"最小字符数\"}", 16));
        builtins.put("TABLE_ROW_COUNT", new BuiltinRule("表行数校验", "TABLE", "校验表的数据行数是否大于指定最小值", 1, "{\"minRows\":0}", "{\"minRows\":\"最小行数\"}", 17));
        builtins.put("CUSTOM_SQL", new BuiltinRule("自定义SQL校验", "FIELD", "通过自定义SQL查询进行校验", 1, null, null, 18));
        builtins.put("SCRIPT", new BuiltinRule("动态脚本校验", "FIELD", "支持JavaScript(ES6)或Java动态脚本编写自定义校验逻辑", 1, null, null, 19));

        int inserted = 0;
        for (Map.Entry<String, BuiltinRule> entry : builtins.entrySet()) {
            String typeCode = entry.getKey();
            BuiltinRule rule = entry.getValue();

            Long count = ruleTypeConfigMapper.selectCount(
                    new LambdaQueryWrapper<RuleTypeConfig>().eq(RuleTypeConfig::getTypeCode, typeCode));
            if (count == 0) {
                RuleTypeConfig config = new RuleTypeConfig();
                config.setTypeCode(typeCode);
                config.setTypeName(rule.typeName);
                config.setRuleLevel(rule.ruleLevel);
                config.setDescription(rule.description);
                config.setNeedsParams(rule.needsParams);
                config.setDefaultParams(rule.defaultParams);
                config.setParamTemplate(rule.paramTemplate);
                config.setDictCode(null);
                config.setStatus(1);
                config.setSortOrder(rule.sortOrder);
                ruleTypeConfigMapper.insert(config);
                inserted++;
            }
        }

        if (inserted > 0) {
            log.info("Initialized {} built-in rule types in dep_rule_type_config", inserted);
        } else {
            log.info("All {} built-in rule types already exist in dep_rule_type_config", builtins.size());
        }
    }

    private record BuiltinRule(String typeName, String ruleLevel, String description,
                                int needsParams, String defaultParams, String paramTemplate,
                                int sortOrder) {
    }
}
