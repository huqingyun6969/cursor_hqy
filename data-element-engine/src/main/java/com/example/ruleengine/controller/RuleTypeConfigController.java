package com.example.ruleengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.ruleengine.domain.entity.RuleTypeConfig;
import com.example.ruleengine.domain.vo.R;
import com.example.ruleengine.mapper.RuleTypeConfigMapper;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rule-type")
public class RuleTypeConfigController {
    private final RuleTypeConfigMapper mapper;
    public RuleTypeConfigController(RuleTypeConfigMapper mapper) { this.mapper = mapper; }

    @GetMapping("/list")
    public R<List<RuleTypeConfig>> list() {
        return R.ok(mapper.selectList(new LambdaQueryWrapper<RuleTypeConfig>()
                .orderByAsc(RuleTypeConfig::getSortOrder)));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody RuleTypeConfig config) {
        if (config.getId() != null) {
            mapper.updateById(config);
        } else {
            mapper.insert(config);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
