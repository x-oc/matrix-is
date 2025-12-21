package com.matrix.converter;

import com.matrix.entity.enums.RoleEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToRoleEnumConverter implements Converter<String, RoleEnum> {
    @Override
    public RoleEnum convert(String source) {
        try {
            return RoleEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}