package com.iwhalecloud.dep.runengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.RuleChain;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.mapper.RuleChainMapper;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rule-chain")
public class RuleChainController {
    private final RuleChainMapper mapper;
    public RuleChainController(RuleChainMapper mapper) { this.mapper = mapper; }

    @GetMapping("/list/{groupId}")
    public R<List<RuleChain>> list(@PathVariable Long groupId) {
        LambdaQueryWrapper<RuleChain> query = new LambdaQueryWrapper<>();
        if (groupId != null && groupId > 0) {
            query.eq(RuleChain::getRuleGroupId, groupId);
        }
        query.orderByDesc(RuleChain::getCreatedAt);
        return R.ok(mapper.selectList(query));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody RuleChain chain) {
        if (chain.getId() != null) {
            mapper.updateById(chain);
        } else {
            mapper.insert(chain);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
