package com.dep.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdInfo;

public interface StdInfoService extends IService<StdInfo> {

    PageResult<StdInfo> page(PageQuery query, Long setId, String name, String status);
}
