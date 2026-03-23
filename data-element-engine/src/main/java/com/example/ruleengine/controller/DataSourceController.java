package com.example.ruleengine.controller;

import com.example.ruleengine.domain.dto.DataSourceConfigDTO;
import com.example.ruleengine.domain.entity.DataSourceConfig;
import com.example.ruleengine.domain.vo.R;
import com.example.ruleengine.service.DataSourceConfigService;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/datasource")
public class DataSourceController {

    private final DataSourceConfigService dataSourceConfigService;

    public DataSourceController(DataSourceConfigService dataSourceConfigService) {
        this.dataSourceConfigService = dataSourceConfigService;
    }

    @GetMapping("/list")
    public R<List<DataSourceConfig>> list() {
        return R.ok(dataSourceConfigService.list());
    }

    @GetMapping("/{id}")
    public R<DataSourceConfig> getById(@PathVariable Long id) {
        return R.ok(dataSourceConfigService.getById(id));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody DataSourceConfigDTO dto) {
        DataSourceConfig entity = new DataSourceConfig();
        BeanUtils.copyProperties(dto, entity);
        dataSourceConfigService.saveOrUpdate(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        dataSourceConfigService.removeById(id);
        return R.ok();
    }
}
