package com.dep.controller;

import com.dep.common.R;
import com.dep.entity.StdCatalog;
import com.dep.service.StdCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/catalog")
@RequiredArgsConstructor
public class StdCatalogController {

    private final StdCatalogService stdCatalogService;

    @GetMapping("/tree")
    public R<List<StdCatalog>> tree() {
        return R.ok(stdCatalogService.list());
    }

    @PostMapping
    public R<Void> save(@RequestBody StdCatalog entity) {
        stdCatalogService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdCatalog entity) {
        entity.setId(id);
        stdCatalogService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdCatalogService.removeById(id);
        return R.ok();
    }
}
