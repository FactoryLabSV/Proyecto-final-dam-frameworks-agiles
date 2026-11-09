package com.tamachihua_erp.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Opcional pero recomendado para soportar LocalDateTime que usas en tu SecurityErrorWriter
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}