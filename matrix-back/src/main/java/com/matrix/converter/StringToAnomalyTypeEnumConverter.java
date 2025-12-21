package com.matrix.converter;

import com.matrix.entity.enums.AnomalyTypeEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToAnomalyTypeEnumConverter implements Converter<String, AnomalyTypeEnum> {
    @Override
    public AnomalyTypeEnum convert(String source) {
        try {
            return AnomalyTypeEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}