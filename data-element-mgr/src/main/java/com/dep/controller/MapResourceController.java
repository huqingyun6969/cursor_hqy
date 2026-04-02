package com.dep.controller;

import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.common.R;
import com.dep.entity.MapResource;
import com.dep.service.MapResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map/resource")
@RequiredArgsConstructor
public class MapResourceController {

    private final MapResourceService mapResourceService;

    @GetMapping("/page")
    public R<PageResult<MapResource>> page(PageQuery query,
                                           @RequestParam(required = false) String name,
                                           @RequestParam(required = false) String dataSource) {
        return R.ok(mapResourceService.page(query, name, dataSource));
    }

    @GetMapping("/{id}")
    public R<MapResource> getById(@PathVariable Long id) {
        return R.ok(mapResourceService.getById(id));
    }

    @PostMapping
    public R<Void> save(@RequestBody MapResource entity) {
        mapResourceService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody MapResource entity) {
        entity.setId(id);
        mapResourceService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapResourceService.removeById(id);
        return R.ok();
    }
}
