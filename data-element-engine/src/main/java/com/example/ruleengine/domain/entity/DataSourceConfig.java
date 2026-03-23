package com.example.ruleengine.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("data_source_config")
public class DataSourceConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String description;
    private String dbType;
    private String dbUrl;
    private String dbUsername;
    private String dbPassword;
    private String tableName;
    private String querySql;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
