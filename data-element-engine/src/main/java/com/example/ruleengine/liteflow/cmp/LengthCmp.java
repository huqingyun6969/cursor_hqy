package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;

@LiteflowComponent("length")
public class LengthCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        int minLen = 0;
        int maxLen = Integer.MAX_VALUE;
        Integer exactLen = null;

        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("min")) minLen = params.get("min").asInt();
            if (params.has("max")) maxLen = params.get("max").asInt();
            if (params.has("exact")) exactLen = params.get("exact").asInt();
        }

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            int len = value.toString().length();
            boolean valid;
            if (exactLen != null) {
                valid = len == exactLen;
            } else {
                valid = len >= minLen && len <= maxLen;
            }
            if (!valid) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' length=" + len + " value='" + value + "'");
            }
        }
        ctx.setViolatedRows(violated);
    }
}
