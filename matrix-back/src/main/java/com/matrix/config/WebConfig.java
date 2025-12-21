package com.matrix.config;

import com.matrix.converter.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToRoleEnumConverter());
        registry.addConverter(new StringToAuditStatusEnumConverter());
        registry.addConverter(new StringToAuditTypeEnumConverter());
        registry.addConverter(new StringToTicketStatusEnumConverter());
        registry.addConverter(new StringToSentinelTaskStatusEnumConverter());
        registry.addConverter(new StringToOracleRequestStatusEnumConverter());
        registry.addConverter(new StringToUnitStatusEnumConverter());
        registry.addConverter(new StringToTicketImportanceEnumConverter());
        registry.addConverter(new StringToAnomalyTypeEnumConverter());
        registry.addConverter(new StringToTicketUnitStatusEnumConverter());
    }
}