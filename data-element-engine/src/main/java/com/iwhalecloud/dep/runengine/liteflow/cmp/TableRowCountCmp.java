package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

@LiteflowComponent("tableRowCount")
public class TableRowCountCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String paramsJson = ctx.getCurrentRule().getRuleParams();

        long minRows = 0;
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("minRows")) minRows = params.get("minRows").asLong();
        }

        long totalRows = ctx.getTotalRows();
        if (totalRows <= minRows) {
            ctx.setViolatedRows(1);
            ctx.addViolation("Table row count " + totalRows + " is not > " + minRows);
        } else {
            ctx.setViolatedRows(0);
        }
    }
}
