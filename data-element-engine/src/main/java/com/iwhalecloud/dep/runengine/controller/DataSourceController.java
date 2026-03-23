package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.dto.DataSourceConfigDTO;
import com.iwhalecloud.dep.runengine.domain.entity.DataSourceConfig;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.service.DataSourceConfigService;
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

    @PostMapping("/test")
    public R<String> testConnection(@RequestBody DataSourceConfigDTO dto) {
        try {
            String driverClass;
            String url = dto.getDbUrl().toLowerCase();
            if (url.startsWith("jdbc:mysql:")) driverClass = "com.mysql.cj.jdbc.Driver";
            else if (url.startsWith("jdbc:oracle:")) driverClass = "oracle.jdbc.OracleDriver";
            else if (url.startsWith("jdbc:hive2:")) driverClass = "org.apache.hive.jdbc.HiveDriver";
            else return R.fail("不支持的JDBC URL类型");

            var ds = new org.springframework.jdbc.datasource.DriverManagerDataSource();
            ds.setUrl(dto.getDbUrl());
            ds.setUsername(dto.getDbUsername());
            ds.setPassword(dto.getDbPassword());
            ds.setDriverClassName(driverClass);
            var jdbc = new org.springframework.jdbc.core.JdbcTemplate(ds);
            jdbc.setQueryTimeout(10);
            jdbc.queryForObject("SELECT 1", Integer.class);
            return R.ok("连接成功");
        } catch (Exception e) {
            return R.fail("连接失败: " + e.getMessage());
        }
    }
}
