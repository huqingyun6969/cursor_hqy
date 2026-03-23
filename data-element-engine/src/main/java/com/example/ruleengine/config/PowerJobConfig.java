package com.example.ruleengine.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.powerjob.worker.PowerJobSpringWorker;
import tech.powerjob.worker.common.PowerJobWorkerConfig;

import java.util.List;

@Configuration
@ConditionalOnProperty(name = "powerjob.enabled", havingValue = "true")
public class PowerJobConfig {

    @Bean
    public PowerJobSpringWorker powerJobSpringWorker(
            @org.springframework.beans.factory.annotation.Value("${powerjob.server-address}") String serverAddress,
            @org.springframework.beans.factory.annotation.Value("${powerjob.app-name}") String appName) {
        PowerJobWorkerConfig config = new PowerJobWorkerConfig();
        config.setServerAddress(List.of(serverAddress));
        config.setAppName(appName);
        return new PowerJobSpringWorker(config);
    }
}
