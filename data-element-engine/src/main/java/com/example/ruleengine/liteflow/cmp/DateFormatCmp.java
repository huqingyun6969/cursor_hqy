package com.example.ruleengine.liteflow.cmp;

import com.example.ruleengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@LiteflowComponent("dateFormat")
public class DateFormatCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        String format = "yyyy-MM-dd";
        String minDateStr = null;
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("format")) format = params.get("format").asText();
            if (params.has("minDate")) minDateStr = params.get("minDate").asText();
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
        LocalDate minDate = minDateStr != null ? LocalDate.parse(minDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")) : null;

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            try {
                LocalDate date = LocalDate.parse(value.toString().trim(), formatter);
                if (minDate != null && date.isBefore(minDate)) {
                    violated++;
                    ctx.addViolation("Field '" + fieldName + "' date " + value + " is before min date " + minDateStr);
                }
            } catch (DateTimeParseException e) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' value='" + value + "' invalid date format, expected: " + format);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
