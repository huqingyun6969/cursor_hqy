package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdRefDoc;
import com.dep.mapper.StdRefDocMapper;
import com.dep.service.StdRefDocService;
import org.springframework.stereotype.Service;

@Service
public class StdRefDocServiceImpl extends ServiceImpl<StdRefDocMapper, StdRefDoc>
        implements StdRefDocService {
}
