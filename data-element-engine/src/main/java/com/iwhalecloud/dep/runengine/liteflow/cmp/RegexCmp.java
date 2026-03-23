package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("regex")
public class RegexCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        String regex = ".*";
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("pattern")) regex = params.get("pattern").asText();
        }

        Pattern pattern = Pattern.compile(regex);
        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!pattern.matcher(value.toString()).matches()) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' value='" + value + "' does not match pattern: " + regex);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
