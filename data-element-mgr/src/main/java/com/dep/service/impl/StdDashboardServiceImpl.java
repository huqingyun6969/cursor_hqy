package com.dep.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdDashboard;
import com.dep.mapper.StdDashboardMapper;
import com.dep.service.StdDashboardService;
import org.springframework.stereotype.Service;

@Service
public class StdDashboardServiceImpl extends ServiceImpl<StdDashboardMapper, StdDashboard>
        implements StdDashboardService {

    @Override
    public StdDashboard getLatest() {
        LambdaQueryWrapper<StdDashboard> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(StdDashboard::getSnapshotDate);
        wrapper.last("LIMIT 1");
        return getOne(wrapper);
    }
}
