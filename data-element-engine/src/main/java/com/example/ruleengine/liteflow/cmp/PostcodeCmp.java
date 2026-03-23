package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("postcode")
public class PostcodeCmp extends NodeComponent {

    private static final Pattern POSTCODE_PATTERN = Pattern.compile("^[1-9]\\d{5}$");

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!POSTCODE_PATTERN.matcher(value.toString().trim()).matches()) {
                violated++;
                ctx.addViolation("Invalid postcode: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
