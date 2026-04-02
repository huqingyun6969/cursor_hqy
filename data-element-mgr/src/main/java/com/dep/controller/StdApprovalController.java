package com.dep.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dep.common.R;
import com.dep.entity.StdApproval;
import com.dep.service.StdApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std/approval")
@RequiredArgsConstructor
public class StdApprovalController {

    private final StdApprovalService stdApprovalService;

    @GetMapping("/list")
    public R<List<StdApproval>> list(@RequestParam Long documentId) {
        LambdaQueryWrapper<StdApproval> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StdApproval::getDocumentId, documentId)
               .orderByDesc(StdApproval::getOperatedAt);
        return R.ok(stdApprovalService.list(wrapper));
    }
}
