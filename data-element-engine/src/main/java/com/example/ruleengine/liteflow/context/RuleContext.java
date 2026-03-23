package com.example.ruleengine.liteflow.context;

import com.example.ruleengine.domain.entity.RuleDefinition;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class RuleContext {

    private RuleDefinition currentRule;
    private List<Map<String, Object>> dataRows;
    private long totalRows;
    private long violatedRows;
    private List<String> sampleViolations = new ArrayList<>();
    private Set<String> dictValues;
    private Map<String, Object> ruleParams = new ConcurrentHashMap<>();

    public void addViolation(String sample) {
        if (sampleViolations.size() < 10) {
            sampleViolations.add(sample);
        }
    }

    public void reset() {
        this.violatedRows = 0;
        this.sampleViolations = new ArrayList<>();
        this.ruleParams = new ConcurrentHashMap<>();
    }
}
