package com.matrix.converter;

import com.matrix.entity.enums.TicketImportanceEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToTicketImportanceEnumConverter implements Converter<String, TicketImportanceEnum> {
    @Override
    public TicketImportanceEnum convert(String source) {
        try {
            return TicketImportanceEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}