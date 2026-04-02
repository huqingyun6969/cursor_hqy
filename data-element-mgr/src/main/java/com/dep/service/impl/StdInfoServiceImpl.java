package com.dep.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdInfo;
import com.dep.mapper.StdInfoMapper;
import com.dep.service.StdInfoService;
import org.springframework.stereotype.Service;

@Service
public class StdInfoServiceImpl extends ServiceImpl<StdInfoMapper, StdInfo>
        implements StdInfoService {

    @Override
    public PageResult<StdInfo> page(PageQuery query, Long setId, String name, String status) {
        Page<StdInfo> page = new Page<>(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<StdInfo> wrapper = new LambdaQueryWrapper<>();
        if (setId != null) {
            wrapper.eq(StdInfo::getSetId, setId);
        }
        if (name != null && !name.isBlank()) {
            wrapper.like(StdInfo::getStdName, name);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(StdInfo::getStatus, status);
        }
        wrapper.orderByDesc(StdInfo::getUpdatedAt);
        Page<StdInfo> result = page(page, wrapper);
        return PageResult.of(result.getRecords(), result.getTotal(),
                result.getSize(), result.getCurrent());
    }
}
