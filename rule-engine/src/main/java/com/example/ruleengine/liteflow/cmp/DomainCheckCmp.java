package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.Set;

@LiteflowComponent("domainCheck")
public class DomainCheckCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();
        Set<String> dictValues = ctx.getDictValues();

        if (dictValues == null || dictValues.isEmpty()) {
            return;
        }

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!dictValues.contains(value.toString().trim())) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' value='" + value + "' not in domain values");
            }
        }
        ctx.setViolatedRows(violated);
    }
}
