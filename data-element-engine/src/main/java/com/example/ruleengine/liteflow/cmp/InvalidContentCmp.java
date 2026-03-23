package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@LiteflowComponent("invalidContent")
public class InvalidContentCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Set<String> DEFAULT_INVALID = new HashSet<>(Arrays.asList(
            "test", "null", "空", "无"
    ));
    private static final Set<Character> DEFAULT_INVALID_CHARS = new HashSet<>(Arrays.asList(
            '*', '？', '?'
    ));

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        int minChineseLen = 1;
        int minCharLen = 3;
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("minChineseLen")) minChineseLen = params.get("minChineseLen").asInt();
            if (params.has("minCharLen")) minCharLen = params.get("minCharLen").asInt();
        }

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null || value.toString().trim().isEmpty()) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' is empty");
                continue;
            }
            String str = value.toString().trim();
            if (DEFAULT_INVALID.contains(str.toLowerCase())) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' contains invalid word: " + str);
                continue;
            }
            boolean hasInvalidChar = false;
            for (char c : str.toCharArray()) {
                if (DEFAULT_INVALID_CHARS.contains(c)) {
                    hasInvalidChar = true;
                    break;
                }
            }
            if (hasInvalidChar) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' contains invalid characters: " + str);
                continue;
            }
            long chineseCount = str.chars().filter(c -> Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN).count();
            if (chineseCount > 0) {
                if (chineseCount < minChineseLen) {
                    violated++;
                    ctx.addViolation("Field '" + fieldName + "' Chinese char count=" + chineseCount + " < " + minChineseLen);
                }
            } else {
                if (str.length() < minCharLen) {
                    violated++;
                    ctx.addViolation("Field '" + fieldName + "' length=" + str.length() + " < " + minCharLen);
                }
            }
        }
        ctx.setViolatedRows(violated);
    }
}
