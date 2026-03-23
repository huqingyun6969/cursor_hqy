package com.iwhalecloud.dep.runengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iwhalecloud.dep.runengine.domain.entity.ExecutionViolation;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.mapper.ExecutionViolationMapper;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/violation")
public class ViolationController {
    private final ExecutionViolationMapper mapper;
    public ViolationController(ExecutionViolationMapper mapper) { this.mapper = mapper; }

    @GetMapping("/list")
    public R<Page<ExecutionViolation>> list(
            @RequestParam(required = false) Long detailId,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) String fieldName,
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size) {
        LambdaQueryWrapper<ExecutionViolation> query = new LambdaQueryWrapper<>();
        if (detailId != null) query.eq(ExecutionViolation::getDetailId, detailId);
        if (taskId != null) query.eq(ExecutionViolation::getTaskId, taskId);
        if (fieldName != null && !fieldName.isEmpty()) query.eq(ExecutionViolation::getFieldName, fieldName);
        query.orderByAsc(ExecutionViolation::getRowIndex);
        return R.ok(mapper.selectPage(new Page<>(current, size), query));
    }

    @GetMapping("/count")
    public R<Long> count(@RequestParam(required = false) Long taskId,
                          @RequestParam(required = false) Long detailId) {
        LambdaQueryWrapper<ExecutionViolation> query = new LambdaQueryWrapper<>();
        if (taskId != null) query.eq(ExecutionViolation::getTaskId, taskId);
        if (detailId != null) query.eq(ExecutionViolation::getDetailId, detailId);
        return R.ok(mapper.selectCount(query));
    }
}
