package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@LiteflowComponent("fax")
public class FaxCmp extends NodeComponent {

    private static final Pattern FAX_PATTERN = Pattern.compile("^(0\\d{2,3}-?)?\\d{7,8}(-\\d{1,4})?$");

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            if (!FAX_PATTERN.matcher(value.toString().trim()).matches()) {
                violated++;
                ctx.addViolation("Invalid fax number: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
