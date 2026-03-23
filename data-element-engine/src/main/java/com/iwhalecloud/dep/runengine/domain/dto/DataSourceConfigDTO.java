package com.iwhalecloud.dep.runengine.domain.dto;

import lombok.Data;

@Data
public class DataSourceConfigDTO {
    private Long id;
    private String name;
    private String description;
    private String dbType;
    private String dbUrl;
    private String dbUsername;
    private String dbPassword;
    private Integer status;
}
