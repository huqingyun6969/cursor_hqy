package com.example.ruleengine.service;

import com.example.ruleengine.domain.dto.WorkOrderCreateDTO;
import com.example.ruleengine.domain.entity.WorkOrder;
import com.example.ruleengine.domain.vo.WorkOrderVO;

import java.util.List;

public interface WorkOrderService {

    WorkOrderVO createFromReport(WorkOrderCreateDTO dto);

    WorkOrderVO getDetail(Long orderId);

    List<WorkOrder> list();

    void processAction(Long orderId, String action, String operator, String operatorDept, String comment);
}
