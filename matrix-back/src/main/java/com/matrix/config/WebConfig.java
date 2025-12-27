package com.matrix.config;

import com.matrix.converter.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToRoleEnumConverter());
        registry.addConverter(new StringToAuditTypeEnumConverter());
        registry.addConverter(new StringToTicketStatusEnumConverter());
        registry.addConverter(new StringToSentinelTaskStatusEnumConverter());
        registry.addConverter(new StringToOracleRequestStatusEnumConverter());
        registry.addConverter(new StringToUnitStatusEnumConverter());
        registry.addConverter(new StringToTicketImportanceEnumConverter());
        registry.addConverter(new StringToAnomalyTypeEnumConverter());
        registry.addConverter(new StringToTicketUnitStatusEnumConverter());
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(mapper);
        converters.add(converter);
    }
}