package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("encodingRule")
public class EncodingRuleCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        String pattern = null;
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("pattern")) pattern = params.get("pattern").asText();
        }

        if (pattern == null) {
            pattern = "^[A-Z]\\d{9}$";
        }

        Pattern regex = Pattern.compile(pattern);
        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!regex.matcher(value.toString().trim()).matches()) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' encoding rule violation: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
