package com.example.ruleengine.domain.enums;

public enum RuleType {
    NOT_NULL("非空校验"),
    IS_NULL("空值校验"),
    UNIQUE("唯一性校验"),
    LENGTH("长度校验"),
    REGEX("正则表达式校验"),
    DATE_FORMAT("日期格式校验"),
    ID_CARD("身份证校验"),
    PHONE("手机号校验"),
    DOMAIN_CHECK("值域校验"),
    CUSTOM_SQL("自定义SQL校验"),
    TABLE_ROW_COUNT("表行数校验"),
    ENCODING_RULE("编码规则校验"),
    INVALID_CONTENT("无效内容校验"),
    FAX("传真号码校验"),
    POSTCODE("邮编校验"),
    LANDLINE("座机号码校验"),
    SOCIAL_CREDIT_CODE("统一社会信用代码校验"),
    DATE_RANGE("日期范围校验");

    private final String description;

    RuleType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
