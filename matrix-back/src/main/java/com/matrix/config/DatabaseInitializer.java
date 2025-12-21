package com.matrix.config;
import com.matrix.repository.RoleRepository;
import com.matrix.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @PostConstruct
    @Transactional
    public void init() {
        log.info("Initializing database...");

        try {
            // Check if database is already initialized
            if (roleRepository.count() == 0) {
                log.info("Running database initialization scripts...");

                // Execute SQL scripts from files
                executeScript("creating.sql");

                log.info("Database initialized successfully");
            } else {
                log.info("Database already initialized");
            }
        } catch (Exception e) {
            log.error("Failed to initialize database", e);
        }
    }

    private void executeScript(String scriptName) {
        try {
            ClassPathResource resource = new ClassPathResource(scriptName);
            String sql = FileCopyUtils.copyToString(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));

            // Split by semicolon but preserve function/procedure definitions
            String[] statements = sql.split(";(?=(?:[^']*'[^']*')*[^']*$)");

            for (String statement : statements) {
                statement = statement.trim();
                if (!statement.isEmpty()) {
                    jdbcTemplate.execute(statement);
                }
            }
        } catch (Exception e) {
            log.error("Failed to execute script: {}", scriptName, e);
        }
    }
}