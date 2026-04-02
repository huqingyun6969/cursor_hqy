package com.dep.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dep.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dep_std_approval")
public class StdApproval extends BaseEntity {
    private Long documentId;
    private String action;
    private String operator;
    private String remark;
    private LocalDateTime operatedAt;
}
