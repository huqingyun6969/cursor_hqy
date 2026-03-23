package com.example.ruleengine.service;

import com.example.ruleengine.domain.vo.ExecutionResultVO;

public interface RuleExecutionService {

    ExecutionResultVO executeRuleGroup(Long ruleGroupId);
}
