package com.example.ruleengine.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "powerjob.enabled", havingValue = "true", matchIfMissing = false)
public class PowerJobConfig {
}
