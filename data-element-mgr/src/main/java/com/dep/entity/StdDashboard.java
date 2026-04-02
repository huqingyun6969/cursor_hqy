package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_dashboard")
public class StdDashboard extends BaseEntity {
    private LocalDate snapshotDate;
    private BigDecimal landingRate;
    private BigDecimal landingRateDelta;
    private Integer landingTableCount;
    private BigDecimal landingTableDelta;
    private Integer coveredStdCount;
    private BigDecimal coveredStdDelta;
    private Integer unlandedStdCount;
    private BigDecimal unlandedStdDelta;
}
