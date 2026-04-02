package com.dep.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdSet;

public interface StdSetService extends IService<StdSet> {

    PageResult<StdSet> page(PageQuery query, String name, String status);
}
