package com.dep.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.MapResource;
import com.dep.mapper.MapResourceMapper;
import com.dep.service.MapResourceService;
import org.springframework.stereotype.Service;

@Service
public class MapResourceServiceImpl extends ServiceImpl<MapResourceMapper, MapResource>
        implements MapResourceService {

    @Override
    public PageResult<MapResource> page(PageQuery query, String name, String dataSource) {
        Page<MapResource> page = new Page<>(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<MapResource> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isBlank()) {
            wrapper.like(MapResource::getResourceName, name);
        }
        if (dataSource != null && !dataSource.isBlank()) {
            wrapper.eq(MapResource::getDataSource, dataSource);
        }
        wrapper.orderByDesc(MapResource::getUpdatedAt);
        Page<MapResource> result = page(page, wrapper);
        return PageResult.of(result.getRecords(), result.getTotal(),
                result.getSize(), result.getCurrent());
    }
}
