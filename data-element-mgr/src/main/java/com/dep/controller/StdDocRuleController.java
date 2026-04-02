package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dep.common.R;
import com.dep.entity.StdDocRule;
import com.dep.service.StdDocRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/doc-rule")
@RequiredArgsConstructor
public class StdDocRuleController {

    private final StdDocRuleService stdDocRuleService;

    @GetMapping("/list")
    public R<List<StdDocRule>> list(@RequestParam Long documentId) {
        LambdaQueryWrapper<StdDocRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StdDocRule::getDocumentId, documentId);
        return R.ok(stdDocRuleService.list(wrapper));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdDocRule entity) {
        stdDocRuleService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdDocRule entity) {
        entity.setId(id);
        stdDocRuleService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdDocRuleService.removeById(id);
        return R.ok();
    }
}
