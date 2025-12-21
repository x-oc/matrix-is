package com.matrix.converter;

import com.matrix.entity.enums.SentinelTaskStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToSentinelTaskStatusEnumConverter implements Converter<String, SentinelTaskStatusEnum> {
    @Override
    public SentinelTaskStatusEnum convert(String source) {
        try {
            return SentinelTaskStatusEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}