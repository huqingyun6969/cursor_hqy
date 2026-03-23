package com.iwhalecloud.dep.runengine.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.iwhalecloud.dep.runengine.domain.entity.RuleDefinition;

import java.util.List;

public interface RuleDefinitionService extends IService<RuleDefinition> {

    List<RuleDefinition> getByGroupId(Long groupId);
}
