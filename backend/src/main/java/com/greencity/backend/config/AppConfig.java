package com.greencity.backend.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * @author Anton Gorokh
 */
@EnableScheduling
@EnableJpaAuditing
@EnableTransactionManagement
@EntityScan("com.greencity.model.entity")
@EnableJpaRepositories("com.greencity.model.repository")
@ComponentScan(basePackages = "com.greencity")
public class AppConfig {
}
