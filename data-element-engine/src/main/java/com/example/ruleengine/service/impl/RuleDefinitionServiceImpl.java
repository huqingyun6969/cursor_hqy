package com.example.ruleengine.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.ruleengine.domain.entity.RuleDefinition;
import com.example.ruleengine.mapper.RuleDefinitionMapper;
import com.example.ruleengine.service.RuleDefinitionService;
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
