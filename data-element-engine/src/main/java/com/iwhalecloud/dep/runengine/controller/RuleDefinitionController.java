package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.dto.RuleDefinitionDTO;
import com.iwhalecloud.dep.runengine.domain.entity.RuleDefinition;
import com.iwhalecloud.dep.runengine.domain.enums.RuleType;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.service.RuleDefinitionService;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/rule")
public class RuleDefinitionController {

    private final RuleDefinitionService ruleDefinitionService;

    public RuleDefinitionController(RuleDefinitionService ruleDefinitionService) {
        this.ruleDefinitionService = ruleDefinitionService;
    }

    @GetMapping("/list/{groupId}")
    public R<List<RuleDefinition>> listByGroup(@PathVariable Long groupId) {
        return R.ok(ruleDefinitionService.getByGroupId(groupId));
    }

    @GetMapping("/{id}")
    public R<RuleDefinition> getById(@PathVariable Long id) {
        return R.ok(ruleDefinitionService.getById(id));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody RuleDefinitionDTO dto) {
        RuleDefinition entity = new RuleDefinition();
        BeanUtils.copyProperties(dto, entity);
        ruleDefinitionService.saveOrUpdate(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        ruleDefinitionService.removeById(id);
        return R.ok();
    }

    @GetMapping("/types")
    public R<List<Map<String, String>>> ruleTypes() {
        List<Map<String, String>> types = new ArrayList<>();
        for (RuleType rt : RuleType.values()) {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("value", rt.name());
            map.put("label", rt.getDescription());
            types.add(map);
        }
        return R.ok(types);
    }
}
