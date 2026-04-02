package com.dep.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dep.entity.StdDashboard;

public interface StdDashboardService extends IService<StdDashboard> {

    StdDashboard getLatest();
}
