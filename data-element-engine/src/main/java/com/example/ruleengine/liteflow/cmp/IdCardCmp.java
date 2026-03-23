package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;

@LiteflowComponent("idCard")
public class IdCardCmp extends NodeComponent {

    private static final int[] WEIGHTS = {7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2};
    private static final char[] CHECK_CODES = {'1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'};

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!isValidIdCard(value.toString().trim())) {
                violated++;
                ctx.addViolation("Invalid ID card: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }

    private boolean isValidIdCard(String id) {
        if (id.length() != 18) return false;
        String body = id.substring(0, 17);
        char checkChar = id.charAt(17);

        if (!body.matches("\\d{17}")) return false;

        int sum = 0;
        for (int i = 0; i < 17; i++) {
            sum += (body.charAt(i) - '0') * WEIGHTS[i];
        }
        char expectedCheck = CHECK_CODES[sum % 11];
        return Character.toUpperCase(checkChar) == expectedCheck;
    }
}
