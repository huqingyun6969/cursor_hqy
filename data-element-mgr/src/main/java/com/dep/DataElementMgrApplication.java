package com.dep;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DataElementMgrApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataElementMgrApplication.class, args);
    }
}
