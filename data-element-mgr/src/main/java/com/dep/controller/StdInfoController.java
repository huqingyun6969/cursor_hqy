package com.dep.controller;

import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.common.R;
import com.dep.entity.StdInfo;
import com.dep.service.StdInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/std/info")
@RequiredArgsConstructor
public class StdInfoController {

    private final StdInfoService stdInfoService;

    @GetMapping("/page")
    public R<PageResult<StdInfo>> page(PageQuery query,
                                       @RequestParam(required = false) Long setId,
                                       @RequestParam(required = false) String name,
                                       @RequestParam(required = false) String status) {
        return R.ok(stdInfoService.page(query, setId, name, status));
    }

    @GetMapping("/{id}")
    public R<StdInfo> getById(@PathVariable Long id) {
        return R.ok(stdInfoService.getById(id));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdInfo entity) {
        stdInfoService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdInfo entity) {
        entity.setId(id);
        stdInfoService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdInfoService.removeById(id);
        return R.ok();
    }
}
