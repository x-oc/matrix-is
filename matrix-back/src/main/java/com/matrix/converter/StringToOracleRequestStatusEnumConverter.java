package com.matrix.converter;

import com.matrix.entity.enums.OracleRequestStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToOracleRequestStatusEnumConverter implements Converter<String, OracleRequestStatusEnum> {
    @Override
    public OracleRequestStatusEnum convert(String source) {
        try {
            return OracleRequestStatusEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}