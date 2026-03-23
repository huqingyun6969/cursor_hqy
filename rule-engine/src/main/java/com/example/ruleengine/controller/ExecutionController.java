package com.example.ruleengine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.ruleengine.domain.entity.ExecutionDetail;
import com.example.ruleengine.domain.entity.ExecutionRecord;
import com.example.ruleengine.domain.vo.ExecutionResultVO;
import com.example.ruleengine.domain.vo.R;
import com.example.ruleengine.mapper.ExecutionDetailMapper;
import com.example.ruleengine.mapper.ExecutionRecordMapper;
import com.example.ruleengine.service.RuleExecutionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/execution")
public class ExecutionController {

    private final RuleExecutionService ruleExecutionService;
    private final ExecutionRecordMapper executionRecordMapper;
    private final ExecutionDetailMapper executionDetailMapper;

    public ExecutionController(RuleExecutionService ruleExecutionService,
                                ExecutionRecordMapper executionRecordMapper,
                                ExecutionDetailMapper executionDetailMapper) {
        this.ruleExecutionService = ruleExecutionService;
        this.executionRecordMapper = executionRecordMapper;
        this.executionDetailMapper = executionDetailMapper;
    }

    @PostMapping("/run/{ruleGroupId}")
    public R<ExecutionResultVO> execute(@PathVariable Long ruleGroupId) {
        try {
            return R.ok(ruleExecutionService.executeRuleGroup(ruleGroupId));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @GetMapping("/history")
    public R<List<ExecutionRecord>> history() {
        return R.ok(executionRecordMapper.selectList(
                new LambdaQueryWrapper<ExecutionRecord>()
                        .orderByDesc(ExecutionRecord::getStartTime)
                        .last("LIMIT 50")));
    }

    @GetMapping("/detail/{executionId}")
    public R<List<ExecutionDetail>> detail(@PathVariable Long executionId) {
        return R.ok(executionDetailMapper.selectList(
                new LambdaQueryWrapper<ExecutionDetail>()
                        .eq(ExecutionDetail::getExecutionId, executionId)));
    }
}
