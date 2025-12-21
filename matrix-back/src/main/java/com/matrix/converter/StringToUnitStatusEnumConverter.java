package com.matrix.converter;

import com.matrix.entity.enums.UnitStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToUnitStatusEnumConverter implements Converter<String, UnitStatusEnum> {
    @Override
    public UnitStatusEnum convert(String source) {
        try {
            return UnitStatusEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}