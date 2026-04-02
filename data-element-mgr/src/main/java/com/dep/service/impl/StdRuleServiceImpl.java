package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdRule;
import com.dep.mapper.StdRuleMapper;
import com.dep.service.StdRuleService;
import org.springframework.stereotype.Service;

@Service
public class StdRuleServiceImpl extends ServiceImpl<StdRuleMapper, StdRule>
        implements StdRuleService {
}
