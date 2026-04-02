package com.dep.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.MapResource;

public interface MapResourceService extends IService<MapResource> {

    PageResult<MapResource> page(PageQuery query, String name, String dataSource);
}
