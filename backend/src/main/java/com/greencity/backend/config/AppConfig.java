package com.greencity.backend.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.context.annotation.Configuration;

/**
 * @author Anton Gorokh
 */
@Configuration
@EnableScheduling
@EnableJpaAuditing
@EnableTransactionManagement
@ComponentScan(basePackages = "com.greencity.backend")
@EntityScan(basePackages = "com.greencity.backend.model")
@EnableJpaRepositories(basePackages = "com.greencity.backend.model.repository")
@EnableFeignClients(basePackages = "com.greencity.backend.service.remote")
public class AppConfig {
}
