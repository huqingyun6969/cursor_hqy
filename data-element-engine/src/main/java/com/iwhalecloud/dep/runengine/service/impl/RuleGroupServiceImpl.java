package com.iwhalecloud.dep.runengine.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.iwhalecloud.dep.runengine.domain.entity.RuleGroup;
import com.iwhalecloud.dep.runengine.mapper.RuleGroupMapper;
import com.iwhalecloud.dep.runengine.service.RuleGroupService;
import org.springframework.stereotype.Service;

@Service
public class RuleGroupServiceImpl extends ServiceImpl<RuleGroupMapper, RuleGroup>
        implements RuleGroupService {
}
