package com.dep.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "sso")
public class SsoProperties {
    private String loginUrl;
    private String profileUrl;
    private String clientId;
    private String service;
    private String aesKey;
    private List<String> whiteList;
}
