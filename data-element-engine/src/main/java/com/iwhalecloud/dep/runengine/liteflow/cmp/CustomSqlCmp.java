package com.iwhalecloud.dep.runengine.liteflow.cmp;

import com.iwhalecloud.dep.runengine.liteflow.context.RuleContext;
import com.yomahub.liteflow.annotation.LiteflowComponent;
import com.yomahub.liteflow.core.NodeComponent;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Custom SQL rule component.
 *
 * The customSql field on RuleDefinition defines a SQL expression that is evaluated
 * against each data row. Supported modes:
 *
 * 1) Field-level check: customSql contains a condition expression like "LENGTH(field) > 10"
 *    Each row where the condition is FALSE is counted as a violation.
 *
 * 2) Count mode: if customSql starts with "COUNT:" followed by a condition,
 *    it counts rows matching that condition as violations.
 *    Example: "COUNT: field IS NULL OR field = ''"
 *
 * Since we operate on in-memory data rows (not directly on DB), the SQL is
 * interpreted as a simple expression evaluator against field values.
 */
@LiteflowComponent("customSql")
public class CustomSqlCmp extends NodeComponent {

    private static final Pattern FIELD_PATTERN = Pattern.compile("\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b");

    @Override
    public void process() throws Exception {
        RuleContext ctx = this.getContextBean(RuleContext.class);
        String customSql = ctx.getCurrentRule().getCustomSql();
        String fieldName = ctx.getCurrentRule().getFieldName();
        List<Map<String, Object>> rows = ctx.getDataRows();

        if (customSql == null || customSql.trim().isEmpty()) {
            ctx.setViolatedRows(0);
            ctx.addViolation("CUSTOM_SQL: customSql is empty, nothing to check");
            return;
        }

        String sql = customSql.trim();

        long violated = 0;
        for (Map<String, Object> row : rows) {
            if (!evaluateCondition(sql, row, fieldName)) {
                violated++;
                Object val = row.get(fieldName);
                ctx.addViolation("CUSTOM_SQL violation: " + fieldName + "=" + val);
            }
        }
        ctx.setViolatedRows(violated);
    }

    private boolean evaluateCondition(String condition, Map<String, Object> row, String primaryField) {
        String cond = condition.toUpperCase().trim();

        if (cond.startsWith("COUNT:")) {
            cond = cond.substring(6).trim();
            return !matchesCondition(cond, row, primaryField);
        }

        return matchesCondition(cond, row, primaryField);
    }

    private boolean matchesCondition(String cond, Map<String, Object> row, String primaryField) {
        Object value = row.get(primaryField);
        String strVal = value == null ? null : value.toString().trim();

        if (cond.contains("IS NOT NULL")) {
            return strVal != null && !strVal.isEmpty();
        }
        if (cond.contains("IS NULL")) {
            return strVal == null || strVal.isEmpty();
        }
        if (cond.contains("!= ''") || cond.contains("<> ''")) {
            return strVal != null && !strVal.isEmpty();
        }
        if (cond.contains("= ''")) {
            return strVal == null || strVal.isEmpty();
        }

        if (cond.contains("LENGTH") && cond.contains(">")) {
            if (strVal == null) return false;
            try {
                int threshold = extractNumber(cond);
                return strVal.length() > threshold;
            } catch (Exception e) { return true; }
        }
        if (cond.contains("LENGTH") && cond.contains("<")) {
            if (strVal == null) return true;
            try {
                int threshold = extractNumber(cond);
                return strVal.length() < threshold;
            } catch (Exception e) { return true; }
        }

        if (cond.contains("LIKE")) {
            if (strVal == null) return false;
            String pattern = extractQuotedString(cond);
            if (pattern != null) {
                String regex = pattern.replace("%", ".*").replace("_", ".");
                return strVal.toUpperCase().matches(regex.toUpperCase());
            }
        }

        if (cond.contains("IN (")) {
            if (strVal == null) return false;
            String inList = cond.substring(cond.indexOf("(") + 1, cond.lastIndexOf(")"));
            String[] items = inList.split(",");
            for (String item : items) {
                String cleaned = item.trim().replace("'", "").replace("\"", "");
                if (cleaned.equalsIgnoreCase(strVal)) return true;
            }
            return false;
        }

        return true;
    }

    private int extractNumber(String s) {
        Matcher m = Pattern.compile("\\d+").matcher(s);
        if (m.find()) return Integer.parseInt(m.group());
        return 0;
    }

    private String extractQuotedString(String s) {
        Matcher m = Pattern.compile("'([^']*)'").matcher(s);
        if (m.find()) return m.group(1);
        return null;
    }
}
