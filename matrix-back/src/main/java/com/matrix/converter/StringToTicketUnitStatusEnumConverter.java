package com.matrix.converter;

import com.matrix.entity.enums.TicketUnitStatusEnum;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToTicketUnitStatusEnumConverter implements Converter<String, TicketUnitStatusEnum> {
    @Override
    public TicketUnitStatusEnum convert(String source) {
        try {
            return TicketUnitStatusEnum.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}