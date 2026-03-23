package com.iwhalecloud.dep.runengine.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.iwhalecloud.dep.runengine.domain.entity.DataSourceConfig;
import com.iwhalecloud.dep.runengine.mapper.DataSourceConfigMapper;
import com.iwhalecloud.dep.runengine.service.DataSourceConfigService;
import org.springframework.stereotype.Service;

@Service
public class DataSourceConfigServiceImpl extends ServiceImpl<DataSourceConfigMapper, DataSourceConfig>
        implements DataSourceConfigService {
}
