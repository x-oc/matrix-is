package com.matrix.converter;

import com.matrix.entity.enums.AuditTypeEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToAuditTypeEnumConverter implements Converter<String, AuditTypeEnum> {
    @Override
    public AuditTypeEnum convert(String source) {
        try {
            return AuditTypeEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}