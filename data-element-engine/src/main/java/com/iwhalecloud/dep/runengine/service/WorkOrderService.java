package com.iwhalecloud.dep.runengine.service;

import com.iwhalecloud.dep.runengine.domain.dto.WorkOrderCreateDTO;
import com.iwhalecloud.dep.runengine.domain.entity.WorkOrder;
import com.iwhalecloud.dep.runengine.domain.vo.WorkOrderVO;

import java.util.List;

public interface WorkOrderService {

    WorkOrderVO createFromReport(WorkOrderCreateDTO dto);

    WorkOrderVO getDetail(Long orderId);

    List<WorkOrder> list();

    void processAction(Long orderId, String action, String operator, String operatorDept, String comment);
}
