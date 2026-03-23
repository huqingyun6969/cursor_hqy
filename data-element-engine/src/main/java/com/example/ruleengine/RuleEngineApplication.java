package com.example.ruleengine;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = { tech.powerjob.worker.autoconfigure.PowerJobAutoConfiguration.class })
@MapperScan("com.example.ruleengine.mapper")
public class RuleEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(RuleEngineApplication.class, args);
    }
}
