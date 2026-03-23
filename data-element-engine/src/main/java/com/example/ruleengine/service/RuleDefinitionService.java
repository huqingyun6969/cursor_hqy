package com.example.ruleengine.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.ruleengine.domain.entity.RuleDefinition;

import java.util.List;

public interface RuleDefinitionService extends IService<RuleDefinition> {

    List<RuleDefinition> getByGroupId(Long groupId);
}
