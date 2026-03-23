package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;
import java.util.List;
import java.util.Map;

@LiteflowComponent("isNull")
public class IsNullCmp extends NodeComponent {
    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();
        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null || value.toString().trim().isEmpty()) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' is null/empty");
            }
        }
        ctx.setViolatedRows(violated);
    }
}
