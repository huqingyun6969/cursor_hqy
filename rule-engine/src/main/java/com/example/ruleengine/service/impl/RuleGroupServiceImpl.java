package com.example.ruleengine.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.ruleengine.domain.entity.RuleGroup;
import com.example.ruleengine.mapper.RuleGroupMapper;
import com.example.ruleengine.service.RuleGroupService;
import org.springframework.stereotype.Service;

@Service
public class RuleGroupServiceImpl extends ServiceImpl<RuleGroupMapper, RuleGroup>
        implements RuleGroupService {
}
