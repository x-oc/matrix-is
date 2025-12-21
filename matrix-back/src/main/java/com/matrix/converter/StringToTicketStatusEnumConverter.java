package com.matrix.converter;

import com.matrix.entity.enums.TicketStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToTicketStatusEnumConverter implements Converter<String, TicketStatusEnum> {
    @Override
    public TicketStatusEnum convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        try {
            return TicketStatusEnum.valueOf(source.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}