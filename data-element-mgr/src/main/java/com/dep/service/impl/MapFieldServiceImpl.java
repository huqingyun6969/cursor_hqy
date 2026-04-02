package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.MapField;
import com.dep.mapper.MapFieldMapper;
import com.dep.service.MapFieldService;
import org.springframework.stereotype.Service;

@Service
public class MapFieldServiceImpl extends ServiceImpl<MapFieldMapper, MapField>
        implements MapFieldService {
}
