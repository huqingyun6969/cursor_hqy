package com.dep.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdSet;
import com.dep.mapper.StdSetMapper;
import com.dep.service.StdSetService;
import org.springframework.stereotype.Service;

@Service
public class StdSetServiceImpl extends ServiceImpl<StdSetMapper, StdSet>
        implements StdSetService {

    @Override
    public PageResult<StdSet> page(PageQuery query, String name, String status) {
        Page<StdSet> page = new Page<>(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<StdSet> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isBlank()) {
            wrapper.like(StdSet::getName, name);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(StdSet::getStatus, status);
        }
        wrapper.orderByDesc(StdSet::getUpdatedAt);
        Page<StdSet> result = page(page, wrapper);
        return PageResult.of(result.getRecords(), result.getTotal(),
                result.getSize(), result.getCurrent());
    }
}
