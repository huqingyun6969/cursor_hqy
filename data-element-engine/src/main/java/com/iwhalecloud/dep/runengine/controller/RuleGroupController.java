package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.dto.RuleGroupDTO;
import com.iwhalecloud.dep.runengine.domain.entity.RuleGroup;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.service.RuleGroupService;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rule-group")
public class RuleGroupController {

    private final RuleGroupService ruleGroupService;

    public RuleGroupController(RuleGroupService ruleGroupService) {
        this.ruleGroupService = ruleGroupService;
    }

    @GetMapping("/list")
    public R<List<RuleGroup>> list() {
        return R.ok(ruleGroupService.list());
    }

    @GetMapping("/{id}")
    public R<RuleGroup> getById(@PathVariable Long id) {
        return R.ok(ruleGroupService.getById(id));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody RuleGroupDTO dto) {
        RuleGroup entity = new RuleGroup();
        BeanUtils.copyProperties(dto, entity);
        ruleGroupService.saveOrUpdate(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        ruleGroupService.removeById(id);
        return R.ok();
    }
}
