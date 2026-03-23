package com.iwhalecloud.dep.runengine.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.iwhalecloud.dep.runengine.domain.entity.RuleDefinition;
import com.iwhalecloud.dep.runengine.mapper.RuleDefinitionMapper;
import com.iwhalecloud.dep.runengine.service.RuleDefinitionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RuleDefinitionServiceImpl extends ServiceImpl<RuleDefinitionMapper, RuleDefinition>
        implements RuleDefinitionService {

    @Override
    public List<RuleDefinition> getByGroupId(Long groupId) {
        return list(new LambdaQueryWrapper<RuleDefinition>()
                .eq(RuleDefinition::getRuleGroupId, groupId)
                .eq(RuleDefinition::getStatus, 1)
                .orderByAsc(RuleDefinition::getSortOrder));
    }
}
