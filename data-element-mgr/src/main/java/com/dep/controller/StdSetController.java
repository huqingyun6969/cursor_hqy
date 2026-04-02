package com.dep.controller;

import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.common.R;
import com.dep.entity.StdSet;
import com.dep.service.StdSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/std/set")
@RequiredArgsConstructor
public class StdSetController {

    private final StdSetService stdSetService;

    @GetMapping("/page")
    public R<PageResult<StdSet>> page(PageQuery query,
                                      @RequestParam(required = false) String name,
                                      @RequestParam(required = false) String status) {
        return R.ok(stdSetService.page(query, name, status));
    }

    @GetMapping("/{id}")
    public R<StdSet> getById(@PathVariable Long id) {
        return R.ok(stdSetService.getById(id));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdSet entity) {
        stdSetService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdSet entity) {
        entity.setId(id);
        stdSetService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdSetService.removeById(id);
        return R.ok();
    }
}
