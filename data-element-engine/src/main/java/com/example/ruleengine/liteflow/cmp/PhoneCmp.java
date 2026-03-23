package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("phone")
public class PhoneCmp extends NodeComponent {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!PHONE_PATTERN.matcher(value.toString().trim()).matches()) {
                violated++;
                ctx.addViolation("Invalid phone number: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
