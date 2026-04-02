package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdDocRule;
import com.dep.mapper.StdDocRuleMapper;
import com.dep.service.StdDocRuleService;
import org.springframework.stereotype.Service;

@Service
public class StdDocRuleServiceImpl extends ServiceImpl<StdDocRuleMapper, StdDocRule>
        implements StdDocRuleService {
}
