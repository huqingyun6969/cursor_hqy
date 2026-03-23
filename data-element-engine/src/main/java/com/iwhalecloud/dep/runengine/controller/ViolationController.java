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
            @RequestParam Long detailId,
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size) {
        Page<ExecutionViolation> page = mapper.selectPage(
                new Page<>(current, size),
                new LambdaQueryWrapper<ExecutionViolation>()
                        .eq(ExecutionViolation::getDetailId, detailId)
                        .orderByAsc(ExecutionViolation::getRowIndex));
        return R.ok(page);
    }
}
