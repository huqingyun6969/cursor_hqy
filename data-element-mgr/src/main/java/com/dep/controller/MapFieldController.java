package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dep.common.R;
import com.dep.entity.MapField;
import com.dep.service.MapFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map/field")
@RequiredArgsConstructor
public class MapFieldController {

    private final MapFieldService mapFieldService;

    @GetMapping("/list")
    public R<List<MapField>> list(@RequestParam Long resourceId) {
        LambdaQueryWrapper<MapField> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MapField::getResourceId, resourceId);
        return R.ok(mapFieldService.list(wrapper));
    }

    @PostMapping
    public R<Void> save(@RequestBody MapField entity) {
        mapFieldService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody MapField entity) {
        entity.setId(id);
        mapFieldService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapFieldService.removeById(id);
        return R.ok();
    }

    @PostMapping("/batch")
    public R<Void> batch(@RequestBody List<MapField> entities) {
        mapFieldService.saveOrUpdateBatch(entities);
        return R.ok();
    }
}
