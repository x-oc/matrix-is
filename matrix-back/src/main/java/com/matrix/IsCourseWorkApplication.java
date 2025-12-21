package com.matrix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IsCourseWorkApplication {

    public static void main(String[] args) {
        SpringApplication.run(IsCourseWorkApplication.class, args);
    }
}