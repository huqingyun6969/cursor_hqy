package com.iwhalecloud.dep.runengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("dep_execution_sub_task")
public class ExecutionSubTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private Integer subTaskIndex;
    private String status;
    private Long offsetStart;
    private Long offsetEnd;
    private Long rowCount;
    private Integer processedRules;
    private Integer totalRules;
    private Long violatedCount;
    private Long passedCount;
    private String threadName;
    private BigDecimal cpuUsagePct;
    private Long memoryUsageMb;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationMs;
}
