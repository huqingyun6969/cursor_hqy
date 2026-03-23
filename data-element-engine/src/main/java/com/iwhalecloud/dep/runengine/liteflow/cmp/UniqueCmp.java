package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.*;

@LiteflowComponent("unique")
public class UniqueCmp extends NodeComponent {

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        Map<String, List<Integer>> valueIndex = new HashMap<>();
        for (int i = 0; i < rows.size(); i++) {
            Object value = rows.get(i).get(fieldName);
            String key = value == null ? "__NULL__" : value.toString();
            valueIndex.computeIfAbsent(key, k -> new ArrayList<>()).add(i);
        }

        long violated = 0;
        for (Map.Entry<String, List<Integer>> entry : valueIndex.entrySet()) {
            if (entry.getValue().size() > 1) {
                violated += entry.getValue().size();
                ctx.addViolation("Duplicate value '" + entry.getKey() + "' found " + entry.getValue().size() + " times");
            }
        }
        ctx.setViolatedRows(violated);
    }
}
