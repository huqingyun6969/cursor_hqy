package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;

@LiteflowComponent("socialCreditCode")
public class SocialCreditCodeCmp extends NodeComponent {

    private static final String BASE_CHARS = "0123456789ABCDEFGHJKLMNPQRTUWXY";
    private static final int[] WEIGHTS = {1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28};

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!isValidSocialCreditCode(value.toString().trim())) {
                violated++;
                ctx.addViolation("Invalid social credit code: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }

    private boolean isValidSocialCreditCode(String code) {
        if (code.length() != 18) return false;
        if (!code.matches("[0-9A-HJ-NP-RTUW-Y]{18}")) return false;

        int sum = 0;
        for (int i = 0; i < 17; i++) {
            int idx = BASE_CHARS.indexOf(code.charAt(i));
            if (idx < 0) return false;
            sum += idx * WEIGHTS[i];
        }
        int remainder = sum % 31;
        int checkIndex = remainder == 0 ? 0 : (31 - remainder);
        return BASE_CHARS.charAt(checkIndex) == code.charAt(17);
    }
}
