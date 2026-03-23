package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@LiteflowComponent("dateRange")
public class DateRangeCmp extends NodeComponent {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String fieldName = ctx.getCurrentRule().getFieldName();
        String paramsJson = ctx.getCurrentRule().getRuleParams();
        List<Map<String, Object>> rows = ctx.getDataRows();

        String format = "yyyy-MM-dd";
        String minDateStr = "1949-10-01";
        String compareField = null;
        if (paramsJson != null && !paramsJson.isEmpty()) {
            JsonNode params = MAPPER.readTree(paramsJson);
            if (params.has("format")) format = params.get("format").asText();
            if (params.has("minDate")) minDateStr = params.get("minDate").asText();
            if (params.has("compareField")) compareField = params.get("compareField").asText();
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
        LocalDate minDate = LocalDate.parse(minDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        long violated = 0;
        for (Map<String, Object> row : rows) {
            Object value = row.get(fieldName);
            if (value == null) continue;
            try {
                LocalDate date = LocalDate.parse(value.toString().trim(), formatter);
                if (date.isBefore(minDate)) {
                    violated++;
                    ctx.addViolation("Field '" + fieldName + "' date " + value + " is before " + minDateStr);
                    continue;
                }
                if (compareField != null) {
                    Object compareValue = row.get(compareField);
                    if (compareValue != null) {
                        try {
                            LocalDate compareDate = LocalDate.parse(compareValue.toString().trim(), formatter);
                            if (date.isBefore(compareDate)) {
                                violated++;
                                ctx.addViolation("Field '" + fieldName + "' " + value + " < " + compareField + " " + compareValue);
                            }
                        } catch (DateTimeParseException ignored) {
                        }
                    }
                }
            } catch (DateTimeParseException e) {
                violated++;
                ctx.addViolation("Field '" + fieldName + "' invalid date: " + value);
            }
        }
        ctx.setViolatedRows(violated);
    }
}
