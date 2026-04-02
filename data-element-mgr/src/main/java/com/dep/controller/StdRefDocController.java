package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dep.common.R;
import com.dep.entity.StdRefDoc;
import com.dep.service.StdRefDocService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/ref-doc")
@RequiredArgsConstructor
public class StdRefDocController {

    private final StdRefDocService stdRefDocService;

    @GetMapping("/list")
    public R<List<StdRefDoc>> list(@RequestParam Long stdInfoId) {
        LambdaQueryWrapper<StdRefDoc> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StdRefDoc::getStdInfoId, stdInfoId);
        return R.ok(stdRefDocService.list(wrapper));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdRefDoc entity) {
        stdRefDocService.save(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdRefDocService.removeById(id);
        return R.ok();
    }
}
