package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dep.common.R;
import com.dep.entity.StdRule;
import com.dep.service.StdRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/rule")
@RequiredArgsConstructor
public class StdRuleController {

    private final StdRuleService stdRuleService;

    @GetMapping("/list")
    public R<List<StdRule>> list(@RequestParam Long stdInfoId) {
        LambdaQueryWrapper<StdRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StdRule::getStdInfoId, stdInfoId);
        return R.ok(stdRuleService.list(wrapper));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdRule entity) {
        stdRuleService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdRule entity) {
        entity.setId(id);
        stdRuleService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdRuleService.removeById(id);
        return R.ok();
    }
}
