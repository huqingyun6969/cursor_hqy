package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("landline")
public class LandlineCmp extends NodeComponent {

    private static final Pattern LANDLINE_PATTERN = Pattern.compile("^(0\\d{2,3}-?)?\\d{7,8}$");

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            String val = value.toString().trim();
            boolean isPhone = Pattern.compile("^1[3-9]\\d{9}$").matcher(val).matches();
            boolean isLandline = LANDLINE_PATTERN.matcher(val).matches();
            if (!isPhone && !isLandline) {
                violated++;
                ctx.addViolation("Invalid phone/landline: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
