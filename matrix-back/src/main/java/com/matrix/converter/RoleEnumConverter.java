package com.matrix.converter;

import com.matrix.entity.enums.RoleEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleEnumConverter implements AttributeConverter<RoleEnum, String> {

    @Override
    public String convertToDatabaseColumn(RoleEnum role) {
        if (role == null) {
            return null;
        }
        return role.name();
    }

    @Override
    public RoleEnum convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return RoleEnum.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}