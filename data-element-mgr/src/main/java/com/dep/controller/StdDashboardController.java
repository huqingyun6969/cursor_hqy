package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.common.R;
import com.dep.entity.StdDashboard;
import com.dep.entity.StdInfo;
import com.dep.service.StdDashboardService;
import com.dep.service.StdInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/dashboard")
@RequiredArgsConstructor
public class StdDashboardController {

    private final StdDashboardService stdDashboardService;
    private final StdInfoService stdInfoService;

    @GetMapping("/latest")
    public R<StdDashboard> latest() {
        return R.ok(stdDashboardService.getLatest());
    }

    @GetMapping("/top-standards")
    public R<List<StdInfo>> topStandards() {
        LambdaQueryWrapper<StdInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(StdInfo::getId).last("LIMIT 10");
        return R.ok(stdInfoService.list(wrapper));
    }

    @GetMapping("/top-diversity")
    public R<List<StdInfo>> topDiversity() {
        LambdaQueryWrapper<StdInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(StdInfo::getId).last("LIMIT 10");
        return R.ok(stdInfoService.list(wrapper));
    }

    @GetMapping("/unlanded")
    public R<PageResult<StdInfo>> unlanded(PageQuery query) {
        Page<StdInfo> page = new Page<>(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<StdInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(StdInfo::getStatus, "ACTIVE");
        Page<StdInfo> result = stdInfoService.page(page, wrapper);
        return R.ok(PageResult.of(result.getRecords(), result.getTotal(),
                result.getSize(), result.getCurrent()));
    }
}
