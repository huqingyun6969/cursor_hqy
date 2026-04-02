package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdCatalog;
import com.dep.mapper.StdCatalogMapper;
import com.dep.service.StdCatalogService;
import org.springframework.stereotype.Service;

@Service
public class StdCatalogServiceImpl extends ServiceImpl<StdCatalogMapper, StdCatalog>
        implements StdCatalogService {
}
