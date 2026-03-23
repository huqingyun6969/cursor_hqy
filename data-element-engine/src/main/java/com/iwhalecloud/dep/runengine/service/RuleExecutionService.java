package com.iwhalecloud.dep.runengine.service;

import com.iwhalecloud.dep.runengine.domain.vo.ExecutionResultVO;

public interface RuleExecutionService {

    ExecutionResultVO executeRuleGroup(Long ruleGroupId);
}
