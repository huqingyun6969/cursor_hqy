package com.example.ruleengine.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.ruleengine.domain.entity.DataSourceConfig;
import com.example.ruleengine.mapper.DataSourceConfigMapper;
import com.example.ruleengine.service.DataSourceConfigService;
import org.springframework.stereotype.Service;

@Service
public class DataSourceConfigServiceImpl extends ServiceImpl<DataSourceConfigMapper, DataSourceConfig>
        implements DataSourceConfigService {
}
