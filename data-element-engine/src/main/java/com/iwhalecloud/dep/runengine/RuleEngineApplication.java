package com.iwhalecloud.dep.runengine;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = { tech.powerjob.worker.autoconfigure.PowerJobAutoConfiguration.class })
@MapperScan("com.iwhalecloud.dep.runengine.mapper")
public class RuleEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(RuleEngineApplication.class, args);
    }
}
