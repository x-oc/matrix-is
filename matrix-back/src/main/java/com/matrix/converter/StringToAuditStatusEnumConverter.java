package com.matrix.converter;

import com.matrix.entity.enums.AuditStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToAuditStatusEnumConverter implements Converter<String, AuditStatusEnum> {
    @Override
    public AuditStatusEnum convert(String source) {
        try {
            return AuditStatusEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}