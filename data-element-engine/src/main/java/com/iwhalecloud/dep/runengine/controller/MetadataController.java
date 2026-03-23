package com.iwhalecloud.dep.runengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.Metadata;
import com.iwhalecloud.dep.runengine.domain.entity.MetadataStandard;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.mapper.MetadataMapper;
import com.iwhalecloud.dep.runengine.mapper.MetadataStandardMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metadata")
public class MetadataController {

    private final MetadataMapper metadataMapper;
    private final MetadataStandardMapper standardMapper;

    public MetadataController(MetadataMapper metadataMapper, MetadataStandardMapper standardMapper) {
        this.metadataMapper = metadataMapper;
        this.standardMapper = standardMapper;
    }

    @GetMapping("/list")
    public R<List<Metadata>> list() {
        return R.ok(metadataMapper.selectList(new LambdaQueryWrapper<Metadata>().orderByDesc(Metadata::getCreatedAt)));
    }

    @GetMapping("/{id}")
    public R<Metadata> getById(@PathVariable Long id) {
        return R.ok(metadataMapper.selectById(id));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody Metadata metadata) {
        if (metadata.getId() != null) {
            metadataMapper.updateById(metadata);
        } else {
            metadataMapper.insert(metadata);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        metadataMapper.deleteById(id);
        standardMapper.delete(new LambdaQueryWrapper<MetadataStandard>().eq(MetadataStandard::getMetadataId, id));
        return R.ok();
    }

    @GetMapping("/{metadataId}/standards")
    public R<List<MetadataStandard>> listStandards(@PathVariable Long metadataId) {
        return R.ok(standardMapper.selectList(
                new LambdaQueryWrapper<MetadataStandard>().eq(MetadataStandard::getMetadataId, metadataId)));
    }

    @PostMapping("/standard/save")
    public R<Void> saveStandard(@RequestBody MetadataStandard ms) {
        if (ms.getId() != null) {
            standardMapper.updateById(ms);
        } else {
            standardMapper.insert(ms);
        }
        return R.ok();
    }

    @DeleteMapping("/standard/{id}")
    public R<Void> deleteStandard(@PathVariable Long id) {
        standardMapper.deleteById(id);
        return R.ok();
    }
}
