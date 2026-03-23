package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.dto.WorkOrderCreateDTO;
import com.iwhalecloud.dep.runengine.domain.entity.WorkOrder;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.domain.vo.WorkOrderVO;
import com.iwhalecloud.dep.runengine.service.WorkOrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-order")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @PostMapping("/create")
    public R<WorkOrderVO> create(@RequestBody WorkOrderCreateDTO dto) {
        try {
            return R.ok(workOrderService.createFromReport(dto));
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    public R<WorkOrderVO> detail(@PathVariable Long orderId) {
        return R.ok(workOrderService.getDetail(orderId));
    }

    @GetMapping("/list")
    public R<List<WorkOrder>> list() {
        return R.ok(workOrderService.list());
    }

    @PostMapping("/{orderId}/action")
    public R<Void> action(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        workOrderService.processAction(
                orderId,
                body.getOrDefault("action", ""),
                body.getOrDefault("operator", ""),
                body.getOrDefault("operatorDept", ""),
                body.getOrDefault("comment", "")
        );
        return R.ok();
    }
}
